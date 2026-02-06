---
layout: post
title: Digital Footprint | TryHackMe Room Writeup
date: 2026-02-06 00:00:00
description: Beginner friendly OSINT Challenge
categories: writeups
thumbnail: assets/img/writeups/digitalfootprint/thumbnail.png
giscus_comments: true
---

Welcome to my writeup for the TryHackMe room "Digital Footprint".

{% include figure.liquid loading="eager" path="assets/img/writeups/digitalfootprint/intro.png" class="img-fluid rounded z-depth-1" %}

## Task 1 - The Leaked Photo

> An ACME Jet Solutions employee uploaded a photo of a residential property believed to be linked to ACME Jet's early operations. Can you figure out where the picture was taken to confirm or debunk the rumour? 

> Flag format: THM{City}

We're given this image:

{% include figure.liquid loading="eager" path="assets/img/writeups/digitalfootprint/edited-house-1763031553617.jpg" class="img-fluid rounded z-depth-1" %}

A couple of things stand out immediately. The first is the "The Rectory" and the other is "ADT Armed Response". I didn't find much after searching for "The Rectory" but searching for "ADT Armed Response" led me to the ADT website. ADT is a security company that operates in South Africa.

I also looked at the metadata using [exiftools](https://exiftools.com/) and found GPS coordinates:

```GPSLatitude: 26 deg 12' 14.76"
GPSLongitude: 28 deg 2' 50.28"
```

These coordinates took me to... a desert in Egypt? That can't be right. The file name is "edited-house-1763031553617.jpg", so maybe the image was edited and the GPS coordinates were changed.

I added a - to the latitude and this took me to [redacted], South Africa. This makes sense since ADT operates in South Africa. (The other variations or adding a - to the longitude took me to the ocean)

Now, I couldn't actually find this house but I tried entering this city as the flag and it worked. Onwards!

## Task 2 - Archived Company Website

> ACME Jet Solutions (warc-acme.com/jef/), is all over social meda claiming they were founded in 2025 and that they're the fastest-growing data company in Africa.
But something doesn't add up, one of their ex-employees ensures you that the company existed long before that.
> Your job as an OSINT investigator is to verify their founding date using only public information.
> Flag Format: THM{YYYYMMDDHHMMSS}

This one took a really long time. I started by looking at the [Wayback Machine](https://archive.org/web/) to see if there were any archived versions of their website. But warc-acme.com doesn't exist at all. I also tried looking up "ACME Jet Solutions" but found nothing.

After a lot of digging, I found an interesting page on archive.org: [Archive Team: WARC Grabs](https://archive.org/details/archiveteam_earlywarcs). Perhaps this is what "warc" in warc-acme.com refers to. I looked up just "acme.com" on this page and voila!

{% include figure.liquid loading="eager" path="assets/img/writeups/digitalfootprint/warc.png" class="img-fluid rounded z-depth-1" %}

The first file date in this "WARC" was the flag we needed.

## Task 3 - Mysterious Landmark

> Further Investigation uncovers another image believed to be connected to the company's international expansion.
> Research reveals that to the right of the iconic landmark is a building that played a big role in the fight for independence of a particular country. Signs on the external wall provides the name of the building. 
> Submit the name of building translated into English as the flag.
> The flag format is THM{Landmark}

{% include figure.liquid loading="eager" path="assets/img/writeups/digitalfootprint/landmark-1763035881792.JPG" class="img-fluid rounded z-depth-1" %}

This one was much easier as a quick reverse image search told me that we're looking at the Spire of Dublin in Ireland. I found the location of the image on [google maps](https://maps.app.goo.gl/npuX5H8Ur3FcyL9A6).

{% include figure.liquid loading="eager" path="assets/img/writeups/digitalfootprint/dublin.png" class="img-fluid rounded z-depth-1" %}

The building to the right of the spire is the General Post Office (GPO). The GPO played a big role in the fight for independence of Ireland as it was the headquarters of the Easter Rising in 1916. And it is the flag we needed.

## Task 4 - Internal Documents

> After uncovering ACME Jet Solutions origins and tracing their online presence through archived websites and international landmarks, investigators believe that an internal document was accidentally leaked by one of the company's developers. 
> The document may contain crucial information about the individual responsible for maintaining their systems.

We're provided an odt file with not a lot of information in the text.

{% include figure.liquid loading="eager" path="assets/img/writeups/digitalfootprint/odt.png" class="img-fluid rounded z-depth-1" %}

Looking at the metadata, I found user defined fields that contained a username.

{% include figure.liquid loading="eager" path="assets/img/writeups/digitalfootprint/username.png" class="img-fluid rounded z-depth-1" %}

Checking the username on a username checker I found a youtube channel.

{% include figure.liquid loading="eager" path="assets/img/writeups/digitalfootprint/checker.png" class="img-fluid rounded z-depth-1" %}

The youtube channel on has 1 post and that post has the flag!

{% include figure.liquid loading="eager" path="assets/img/writeups/digitalfootprint/youtube.png" class="img-fluid rounded z-depth-1" %}

And we're done!