# GCP Cloud Workstations — Pulumi examples

This repository provides two Pulumi TypeScript examples for Google Cloud Workstations. Each folder
has its own in‑depth README; this root file is a brief guide.

## Folders

- minimal — A smallest‑possible setup to create a Workstations cluster and configuration with
  sensible defaults. See minimal/README.md for details.
- customized — A variant that uses a customized workstation image and extra configuration. See
  customized/README.md for details.

## Quick start

- Minimal example: cd minimal and read README.md
- Customized example: cd customized and read README.md

## Notes

- Both examples use Pulumi with Node.js/TypeScript and Bun as the package manager (defined in each
  folder’s Pulumi.yaml).
- You’ll need a GCP project with billing enabled and appropriate IAM permissions; follow the chosen
  folder’s README for tool versions and commands.
