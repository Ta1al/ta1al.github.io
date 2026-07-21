+++
title = 'Digital Footprint | TryHackMe Room Writeup'
date = '2026-02-06T00:00:00+05:00'
lastmod = '2026-02-06T00:00:00+05:00'
draft = false
description = 'A beginner-friendly OSINT walkthrough of the TryHackMe Digital Footprint room.'
categories = ['Writeups']
tags = ['TryHackMe', 'OSINT']
toc = true
image = '/images/digitalfootprint/thumbnail.png'
+++

Welcome to my writeup for the TryHackMe room **Digital Footprint**. The room works through a series of beginner-friendly OSINT challenges involving image analysis, web archives, landmark identification, and document metadata.

![Digital Footprint room introduction](/images/digitalfootprint/intro.png)

## Task 1 — The Leaked Photo

The first task asks us to identify the city where a photo of a residential property was taken. The required flag format is `THM{City}`.

![Residential property provided in the challenge](/images/digitalfootprint/edited-house-1763031553617.jpg)

Two details stood out immediately: **The Rectory** and **ADT Armed Response**. Searching for “The Rectory” did not reveal much, but searching for “ADT Armed Response” led me to ADT, a security company operating in South Africa.

I also inspected the image metadata with [ExifTool](https://exiftool.org/) and found GPS coordinates:

```text
GPSLatitude: 26 deg 12' 14.76"
GPSLongitude: 28 deg 2' 50.28"
```

Those coordinates initially placed the image in a desert in Egypt, which did not make sense. The filename—`edited-house-1763031553617.jpg`—suggested that the image may have been modified, possibly including its GPS data.

Adding a negative sign to the latitude moved the location to **[redacted], South Africa**, which aligned with the ADT clue. The other sign variations pointed into the ocean.

I could not locate the exact house, but submitting the resulting city produced the correct flag. Onwards!

## Task 2 — Archived Company Website

The second task challenges the company’s claimed 2025 founding date. We need to verify when it actually appeared using public archive data, with the flag formatted as `THM{YYYYMMDDHHMMSS}`.

This one took a while. I started with the [Wayback Machine](https://archive.org/web/) but found no archived versions of `warc-acme.com`. Searching for the company name also produced nothing useful.

After more digging, I found [Archive Team: WARC Grabs](https://archive.org/details/archiveteam_earlywarcs) on the Internet Archive. That suggested that “warc” in the challenge domain was a hint toward **Web ARChive** files. Searching the collection for `acme.com` revealed the relevant capture.

![WARC archive results for ACME](/images/digitalfootprint/warc.png)

The timestamp of the first file in the WARC was the flag required by the task.

## Task 3 — Mysterious Landmark

The third task provides an image of a landmark and asks for the English name of a nearby building connected to a country’s fight for independence. The flag format is `THM{Landmark}`.

![Landmark image provided in the challenge](/images/digitalfootprint/landmark-1763035881792.JPG)

A reverse-image search quickly identified the landmark as the **Spire of Dublin** in Ireland. I then found the viewpoint on [Google Maps](https://maps.app.goo.gl/npuX5H8Ur3FcyL9A6).

![Google Maps view of the Spire of Dublin](/images/digitalfootprint/dublin.png)

The building to the right of the Spire is the **General Post Office (GPO)**. It played an important role in Ireland’s fight for independence by serving as the headquarters of the 1916 Easter Rising. Its translated English name was the answer required by the task.

## Task 4 — Internal Documents

The final task revolves around an internal document accidentally leaked by one of the company’s developers. The document may reveal the person responsible for maintaining the company’s systems.

We are given an ODT file with very little useful information in its visible text.

![Visible contents of the leaked ODT document](/images/digitalfootprint/odt.png)

Inspecting the document metadata revealed user-defined fields containing a username.

![Username discovered in the document metadata](/images/digitalfootprint/username.png)

I checked that username with a username-search tool and found a matching YouTube channel.

![Username checker results](/images/digitalfootprint/checker.png)

The channel had only one post, and that post contained the final flag.

![YouTube channel containing the final clue](/images/digitalfootprint/youtube.png)

And we’re done!
