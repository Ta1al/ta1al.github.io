---
layout: post
title: Networking Fundamentals - OSI Model and TCP/IP
date: 2025-09-05 00:00:00
description: Understanding the OSI model, TCP/IP layers, network protocols, and practical network analysis
categories: cybersecurity, buildables-fellowship
thumbnail: assets/img/networking.png
giscus_comments: true
toc:
  sidebar: left
---

This post is part of my Buildables Fellowship.

# Networking Fundamentals: OSI Model and TCP/IP

Understanding how networks operate is crucial for cybersecurity professionals. This post covers the foundational concepts of network communication, including the OSI model, TCP/IP layers, and common protocols.

## The OSI Model

The Open Systems Interconnection (OSI) model is a conceptual framework that standardizes network communication into seven layers. Each layer has specific responsibilities and communicates with the layers directly above and below it.

### Layer 7: Application Layer
**What it does:** This is where user applications and network services interact with the network.
- **Examples:** Web browsers (HTTP/HTTPS), email clients (SMTP), file transfer programs (FTP)
- **Think of it as:** The interface between users and the network - what you actually see and interact with

### Layer 6: Presentation Layer
**What it does:** Handles data formatting, encryption, compression, and translation between different character sets.
- **Examples:** SSL/TLS encryption, JPEG/GIF image formats, ASCII/Unicode text encoding
- **Think of it as:** The translator that ensures data is in the right format for the receiving application

### Layer 5: Session Layer
**What it does:** Manages communication sessions between applications, including establishing, maintaining, and terminating connections.
- **Examples:** SQL sessions, NetBIOS, RPC (Remote Procedure Calls)
- **Think of it as:** The traffic controller that manages conversations between applications

### Layer 4: Transport Layer
**What it does:** Provides reliable data transfer between end systems, including error detection, flow control, and segmentation.
- **Protocols:** TCP (reliable, connection-oriented), UDP (fast, connectionless)
- **Think of it as:** The delivery service that ensures data gets to its destination intact

### Layer 3: Network Layer
**What it does:** Routes data between different networks using logical addressing (IP addresses).
- **Protocols:** IP (Internet Protocol), ICMP, routing protocols (OSPF, BGP)
- **Think of it as:** The postal system that determines the best path for data to travel

### Layer 2: Data Link Layer
**What it does:** Handles communication between directly connected devices using physical addresses (MAC addresses).
- **Examples:** Ethernet frames, Wi-Fi, switches, MAC addresses
- **Think of it as:** The local delivery service within a neighborhood

### Layer 1: Physical Layer
**What it does:** Defines the physical connection between devices - cables, radio waves, electrical signals.
- **Examples:** Ethernet cables, fiber optic cables, radio frequencies, voltage levels
- **Think of it as:** The actual roads, wires, and airways that carry the data

## TCP/IP Model

The TCP/IP model is a more practical four-layer model that's actually used in real networks:

### Application Layer (OSI Layers 5-7)
Combines the functionality of OSI's Session, Presentation, and Application layers.
- **What happens:** Applications directly interact with network services
- **Examples:** HTTP, HTTPS, FTP, SSH, SMTP, DNS

### Transport Layer (OSI Layer 4)
Same as OSI's Transport layer.
- **What happens:** Data is segmented and reassembled, reliability is ensured
- **Protocols:** TCP, UDP

### Internet Layer (OSI Layer 3)
Similar to OSI's Network layer.
- **What happens:** Routing between networks using IP addresses
- **Main Protocol:** IP (Internet Protocol)

### Network Access Layer (OSI Layers 1-2)
Combines OSI's Physical and Data Link layers.
- **What happens:** Physical transmission and local network delivery
- **Examples:** Ethernet, Wi-Fi, MAC addressing

## How Internet Connection Works

Here's a simplified diagram of how a device connects to the internet:

```
[Your Device] → [Router/Gateway] → [ISP] → [Internet]
      ↓              ↓            ↓
   MAC Address → DHCP assigns → DNS resolves
   IP Address    IP Address     domain names
```

### The Connection Process:
1. **Physical Connection:** Device connects via Ethernet/Wi-Fi (Layer 1-2)
2. **DHCP Assignment:** Router assigns IP address, subnet mask, gateway (Layer 3)
3. **DNS Resolution:** Domain names are translated to IP addresses (Layer 7)
4. **Routing:** Data is routed through multiple networks to reach destination (Layer 3)
5. **Application Communication:** Your browser communicates with web servers (Layer 7)

## Key Network Components

### IP Addresses
- **IPv4:** 32-bit addresses (e.g., 192.168.1.100)
- **IPv6:** 128-bit addresses (e.g., 2001:db8::1)
- **Purpose:** Logical addressing for routing between networks

### MAC Addresses
- **Format:** 48-bit hardware addresses (e.g., 00:1B:44:11:3A:B7)
- **Purpose:** Physical addressing for local network communication
- **Scope:** Only relevant within the local network segment

### DNS (Domain Name System)
- **Purpose:** Translates human-readable domain names to IP addresses
- **Process:** Client queries DNS server, receives IP address, connects to server
- **Example:** google.com → 142.250.191.14

### DHCP (Dynamic Host Configuration Protocol)
- **Purpose:** Automatically assigns IP addresses and network configuration
- **Benefits:** Eliminates manual IP configuration, prevents conflicts
- **Information Provided:** IP address, subnet mask, default gateway, DNS servers

## Common Protocols and Ports

### Web Services
- **HTTP:** Port 80 - Unencrypted web traffic
- **HTTPS:** Port 443 - Encrypted web traffic (SSL/TLS)

### File Transfer
- **FTP:** Port 21 - File Transfer Protocol (insecure)
- **SFTP:** Port 22 - Secure File Transfer over SSH
- **FTPS:** Port 990 - FTP over SSL/TLS

### Remote Access
- **SSH:** Port 22 - Secure Shell for encrypted remote access
- **Telnet:** Port 23 - Unencrypted remote access (insecure)
- **RDP:** Port 3389 - Remote Desktop Protocol (Windows)

### Email
- **SMTP:** Port 25/587 - Simple Mail Transfer Protocol (sending)
- **POP3:** Port 110 - Post Office Protocol (receiving)
- **IMAP:** Port 143 - Internet Message Access Protocol (receiving)

### DNS and Network Services
- **DNS:** Port 53 - Domain Name System
- **DHCP:** Port 67/68 - Dynamic Host Configuration Protocol
- **SNMP:** Port 161 - Simple Network Management Protocol

### Database
- **MySQL:** Port 3306
- **PostgreSQL:** Port 5432
- **Microsoft SQL:** Port 1433

## Network Analysis with Wireshark

Wireshark is a powerful network protocol analyzer that captures and displays network traffic in real-time.

### Common Protocols:
1. **ARP (Address Resolution Protocol):** Mapping IP addresses to MAC addresses
2. **DNS:** Domain name resolution queries and responses
3. **HTTP/HTTPS:** Web traffic between browsers and servers
4. **TCP:** Connection establishment (3-way handshake) and data transfer
5. **ICMP:** Network diagnostics and error messages

### Main Information:
- **Source and Destination:** IP and MAC addresses
- **Protocol Types:** HTTP, DNS, ARP, TCP, UDP, etc.
- **Packet Sizes:** Varying based on data being transmitted
- **Timing:** Request-response patterns and connection durations
- **Flags:** TCP flags showing connection states (SYN, ACK, FIN, RST)


## Essential Protocols to Remember:
- **HTTP (80):** Web traffic, unencrypted
- **HTTPS (443):** Web traffic, encrypted
- **SSH (22):** Secure remote access
- **FTP (21):** File transfer, insecure
- **SMTP (25/587):** Email sending
- **DNS (53):** Name resolution
- **DHCP (67/68):** IP address assignment
- **ICMP:** Network diagnostics (ping, traceroute)
- **ARP:** IP to MAC address mapping
- **SNMP (161):** Network management

## Key Takeaways

1. **OSI Model:** Provides a structured way to understand network communication in seven layers
2. **TCP/IP Model:** The practical four-layer model used in real networks
3. **Addressing:** MAC addresses for local communication, IP addresses for network routing
4. **Services:** DNS translates names to IPs, DHCP assigns network configuration
5. **Protocols:** Each has a specific purpose and default port number
6. **Analysis:** Tools like Wireshark help visualize and understand network traffic

Understanding these networking fundamentals is crucial for cybersecurity, as most attacks and defenses involve network communication.

