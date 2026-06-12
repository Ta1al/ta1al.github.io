---
title: "Setting Up a Home SOC Lab"
description: "A walkthrough of my home SOC lab setup using open-source tools for threat detection and monitoring."
date: 2026-05-28
categories: ["security", "soc"]
---

Running a Security Operations Center (SOC) at home might sound excessive, but it's one of the best ways to learn blue-team skills hands-on.

## The Stack

My home lab consists of:

- **Wazuh** — Open-source SIEM for log collection and analysis
- **TheHive** — Incident response platform
- **Cortex** — Observable analysis and automation
- **pfSense** — Firewall and network segmentation

## Data Sources

I forward logs from several sources:

1. Home server (SSH, auth logs, system events)
2. Docker containers (application logs)
3. pfSense (firewall drops, VPN connections)
4. A small DMZ with intentionally vulnerable VMs

## Detection Rules

Wazuh comes with a solid set of default rules, but I've been writing custom ones for scenarios relevant to my home network. The ability to test detection logic against real traffic (with known good/baseline behavior) is invaluable.
