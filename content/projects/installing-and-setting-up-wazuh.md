+++
title = 'Installing and Setting Up Wazuh'
date = '2026-07-21T00:00:00+05:00'
description = 'Deploying a Wazuh SIEM environment and preparing it for centralized endpoint and firewall security monitoring.'
discipline = 'cybersecurity'
status = 'completed'
technologies = ['Wazuh', 'Linux', 'pfSense', 'rsyslog', 'SIEM']
featured = true
+++

## Objective

Build a centralized security-monitoring environment capable of collecting endpoint and firewall telemetry, presenting alerts in a unified dashboard, and supporting repeatable SOC investigations.

## Deployment

I deployed the Wazuh server components on Linux and configured the manager, indexer, and dashboard services. After validating service health and dashboard access, I enrolled endpoints with Wazuh agents and confirmed that their security events reached the manager.

## Firewall log integration

To expand visibility beyond endpoints, I configured pfSense to forward firewall events through `rsyslog`. The logs were ingested by Wazuh, decoded, and made available for centralized searching and alert analysis.

## Validation

I generated test activity from monitored systems and verified that authentication events, endpoint telemetry, blocked connections, and suspicious traffic appeared in the dashboard. This provided a working foundation for alert triage, event correlation, and investigation workflows.

## Outcome

The completed environment centralized host and network security data, reduced the need to inspect systems independently, and created a practical SIEM lab for detection and incident-response exercises.
