---
layout: post
title: TryHackMe SOC Analyst L1 Path
date: 2025-07-24 00:00:00
description: The journey through the TryHackMe SOC path
categories: cybersecurity
thumbnail: assets/img/thm.png
giscus_comments: true
toc:
  sidebar: left
---
<div class="row">
    <a class="col-sm mt-3 mt-md-0" href="https://tryhackme.com/certificate/THM-M4ZQHRNWOY">
        {% include figure.liquid loading="eager" path="assets/img/certs/THM-SOC-L1.png" title="SOC L1 Certificate" class="img-fluid rounded z-depth-1" zoomable=true %}
    </a>
</div>

I finally completed the TryHackMe SOC path! It was a challenging but rewarding experience. The path covered a wide range of topics related to security operations centers, including incident response, threat hunting, and log analysis.
I learned a lot about the tools and techniques used by SOC analysts, and I feel much more confident in my ability to work in a SOC environment. The hands-on labs were particularly helpful, as they allowed me to apply what I learned in a practical setting.

I highly recommend this path to anyone interested in cybersecurity, especially those looking to work in a SOC. The content is well-structured and the challenges are engaging. Plus, the community support on TryHackMe is fantastic, making it easy to get help when needed.

---
### <strong>The Modules</strong>
The path had 8 modules:

##### <strong>Module 1: Cyber Defence Frameworks</strong>
This was the easiest and most straightforward module. I got through all 8 rooms in a single day. It was super easy barely an inconvenience.

<details>
  <summary>8 Rooms</summary>
  
  <div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/certs/modules/m1.png" title="Module 1" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
  </div>
</details>
---

##### <strong>Module 2: Cyber Threat Intelligence</strong>
After the first module, I kind of went into sleep mode and did nothing for the new few weeks. It was really hard to get myself to return. It took me 24 days to actually start the second module.

This module was a little more interesting but still boring in the grand scheme of things. I learned about the different types of threat intelligence tools and how to use them to gather information about potential threats. I finally learned how to use YARA rules (I'm probably still going to ask ChatGPT to generate them for me). I also learned OpenCTI and MISP! My favorite room from this module was <a href="https://tryhackme.com/room/fridayovertime">Friday Overtime</a> where I investigated an attack and got to use my OSINT skills.

<details>
  <summary>7 Rooms</summary>
  
  <div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/certs/modules/m2.png" title="Module 2" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
  </div>
</details>
---

##### <strong>Module 3: Network Security and Traffic Analysis</strong>
From this point on, I was on a roll. It took me a whole week to finish this module, but I was super consistent and put in the work every single day.

This module had 15 rooms. A lot of new tools and a <italic>lot</italic> of commands to learn. My favorite tool of the bunch was Brim (other than Wireshark, of course). I really loved the interface of Brim and how it made analyzing pcap files so much easier. I also learned about Zeek and TShark.

Overall, this room was pretty tough since I'm bad a memorizing things. I had to keep looking up commands. I honestly don't remember most of them now.

<details>
  <summary>15 Rooms</summary>
  
  <div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/certs/modules/m3.png" title="Module 3" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
  </div>
</details>
---

##### <strong>Module 4: Endpoint Security Monitoring</strong>
In this module, I discovered that OSQuery is a thing. I had never heard of it before, but it's a really cool tool for endpoint monitoring. I also learned about Sysmon and how to use it to monitor Windows systems. I have learned Wazuh before but I got to learn more about it in this module. Woo lots of logs!

<details>
  <summary>9 Rooms</summary>
  
  <div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/certs/modules/m4.png" title="Module 4" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
  </div>
</details>
---

##### <strong>Module 5: Security Information and Event Management</strong>
Hands down my favorite module. I learned about SIEMs and how they work. I also got to use Splunk for the first time! I had heard a lot about it but never actually used it before. It was really fun to play around with and I learned a lot about how to use it for log analysis.

I also learned about ELK and how to use it for log analysis. I had used ELK before but never really understood how it worked. This module really helped me understand the inner workings of ELK and how to use it effectively.

<a href="https://tryhackme.com/room/itsybitsy">Itsy Bitsy</a> and <a href="https://tryhackme.com/room/benign">Benign</a> were my favorite rooms from this module. They were both really fun and challenging.

<details>
  <summary>9 Rooms</summary>
  
  <div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/certs/modules/m5.png" title="Module 5" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
  </div>
</details>
---

##### <strong>Module 6: Digital Forensics and Incident Response</strong>
Another long and honestly boring module. The main thing I learned from this module is that I really don't like digital forensics. It's just not my thing. I did learn a lot about the different tools and techniques used in digital forensics, but I don't think I'll be using them anytime soon.

<details>
  <summary>15 Rooms</summary>
  
  <div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/certs/modules/m6.png" title="Module 6" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
  </div>
</details>
---

##### <strong>Module 7: Phishing</strong>
This module was a lot of fun! I learned about the different types of phishing attacks and how to defend against them. Lots of fishing 🐟🐟

<details>
  <summary>6 Rooms</summary>
  
  <div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/certs/modules/m7.png" title="Module 7" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
  </div>
</details>
---

##### <strong>Capstone</strong>
The final 4 rooms were actually really tough. <a href="https://tryhackme.com/room/tempestincident">Tempest</a> took me a whole day to complete. Boogeyman [1](https://tryhackme.com/room/boogeyman1) and [2](https://tryhackme.com/room/boogeyman2) were also really challenging. I had to use all the skills I learned in the previous modules to complete them. It was a great way to wrap up the path and test my knowledge.

The most fun was the final challenge <a href="https://tryhackme.com/room/boogeyman3">Boogeyman 3</a>. Working with Elastic and Kibana is so much fun! I really enjoyed analyzing the logs and finding the clues to solve the challenge. It was a great way to end the path.

<details>
  <summary>4 Rooms</summary>
  
  <div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/certs/modules/m8.png" title="Capstone" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
  </div> 
</details>
---

#### <strong>Final Thoughts</strong>
I really enjoyed this whole path. It was a great way to learn about SOC operations and the tools used in the field. I feel much more confident in my ability to work in a SOC environment now. Happy hacking!

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/certs/final.png" title="I did it!" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>