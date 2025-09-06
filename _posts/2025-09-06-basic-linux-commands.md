---
layout: post
title: Basic Linux Commands
date: 2025-09-06 00:00:00
description: Essential Linux commands for navigation, system information, user management, and permissions
categories: cybersecurity, buildables-fellowship
thumbnail: assets/img/linux-terminal.png
giscus_comments: true
toc:
  sidebar: left
---

This post is part of my Buildables Fellowship.

# Basic Linux Commands

Linux commands are the foundation of system administration and cybersecurity work. Understanding these basic commands is essential for anyone working in IT or cybersecurity, as Linux is widely used in servers, security tools, and enterprise environments.

## Navigation Commands

### `ls` - List Directory Contents
The `ls` command displays the contents of a directory, showing files and folders in the current or specified location.

```bash
ls          # List files in current directory
ls -l       # List with detailed information (permissions, size, date)
ls -la      # List all files including hidden ones with details
ls -lh      # List with human-readable file sizes
```

### `cd` - Change Directory
The `cd` command allows you to navigate between directories in the file system.

```bash
cd /home/user    # Change to specific directory
cd ..            # Go up one directory level
cd ~             # Go to home directory
cd -             # Go back to previous directory
```

### `pwd` - Print Working Directory
The `pwd` command shows your current location in the file system - the full path of where you are right now.

```bash
pwd
# Output: /home/username/Documents
```

---

## Common Command Line Tools

### `netstat` - Network Statistics
The `netstat` command displays network connections, routing tables, and network statistics. It's crucial for monitoring network activity and troubleshooting connectivity issues.

```bash
netstat -tuln    # Show all listening ports (TCP and UDP)
netstat -an      # Show all connections and listening ports
netstat -rn      # Show routing table
```

**What it does:** 
- Shows active network connections
- Displays listening ports and services
- Provides routing information
- Helps identify suspicious network activity

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/basic_commands/netstat.png" title="netstat command output" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

### `ping` - Network Connectivity Test
The `ping` command tests connectivity between your system and a target host by sending ICMP echo request packets.

```bash
ping google.com       # Ping a website
ping -c 4 8.8.8.8    # Ping with limited packet count
ping 192.168.1.1     # Ping local gateway
```

**What it does:**
- Tests if a host is reachable
- Measures round-trip time
- Shows packet loss statistics
- Verifies DNS resolution

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/basic_commands/ping.png" title="ping command output" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

### `ifconfig` - Interface Configuration
The `ifconfig` command displays and configures network interface parameters. On newer systems, `ip` command is often preferred.

```bash
ifconfig              # Show all network interfaces
ifconfig eth0         # Show specific interface
ifconfig eth0 up      # Enable interface
ifconfig eth0 down    # Disable interface
```

**What it does:**
- Displays network interface information
- Shows IP addresses, MAC addresses
- Configures network interfaces
- Enables/disables network interfaces


<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/basic_commands/ifconfig.png" title="ifconfig command output" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

### `whoami` - Current User Identity
The `whoami` command displays the username of the currently logged-in user.

```bash
whoami
# Output: username
```

**What it does:**
- Shows current user identity
- Useful in scripts to verify user context
- Helps when switching between users


<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/basic_commands/whoami.png" title="whoami command output" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

---

## User Management

### Creating a New User
The `adduser` command creates a new user account on the system. This requires administrative privileges.

```bash
sudo adduser testuser
```

**What it does:**
- Creates a new user account
- Sets up home directory
- Prompts for password and user information
- Adds user to default groups

**Process:**
1. Creates user entry in `/etc/passwd`
2. Creates home directory (`/home/testuser`)
3. Copies default configuration files
4. Sets up initial permissions

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/basic_commands/create_user.png" title="Creating a new user with adduser command" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

---

## Permissions Management

### Creating a Directory and Setting Ownership

```bash
sudo mkdir /home/testfolder
```
**What it does:** Creates a new directory called "testfolder" in the `/home` directory.

### Changing Ownership

```bash
sudo chown testuser:testuser /home/testfolder
```
**What it does:** Changes the ownership of `/home/testfolder` to user `testuser` and group `testuser`. The format is `user:group`.

### Setting Permissions

```bash
sudo chmod 700 /home/testfolder
```
**What it does:** Sets permissions to `700`, which means:
- **7** (owner): read, write, execute (4+2+1)
- **0** (group): no permissions
- **0** (others): no permissions

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/basic_commands/permissions.png" title="Directory creation and permissions management commands" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>

## Permission Numbers Explained

Linux permissions use a three-digit octal system:
- **4** = read permission
- **2** = write permission  
- **1** = execute permission

Common permission combinations:
- **755**: Owner can do everything, group and others can read and execute
- **644**: Owner can read and write, group and others can only read
- **700**: Only owner has full access, no access for group or others
- **600**: Only owner can read and write, no access for anyone else

---

These basic commands form the foundation of Linux system administration.
