# GCP Cloud Workstations — Pulumi examples

Check out [Cloud Workstations: building reusable development environments in cloud][article-1]
and [Cloud Workstations: building reusable development environments in cloud - Part 2][article-2] 
articles for step-by-step tutorials.

This repository provides two Pulumi TypeScript examples for Google Cloud Workstations. Each folder
has its own in‑depth README; this root file is a brief guide.

## Folders

- minimal — A smallest‑possible setup to create a Workstations cluster and configuration with
  sensible defaults. See [minimal/README.md](minimal/README.md) for details.
- customized — A variant that uses a customized workstation image and extra configuration. See
  [customized/README.md](customized/README.md) for details.

## Quick start

- Minimal example: cd minimal and read README.md
- Customized example: cd customized and read README.md

## Notes

- Both examples use Pulumi with Node.js/TypeScript and Bun as the package manager (defined in each
  folder’s Pulumi.yaml).
- You’ll need a GCP project with billing enabled and appropriate IAM permissions; follow the chosen
  folder’s README for tool versions and commands.

[article-1]: https://medium.com/google-cloud/cloud-workstations-building-reusable-development-environments-in-cloud-262bc0dcdb57
[article-2]: https://medium.com/google-cloud/cloud-workstations-building-reusable-development-environments-in-cloud-part-2-90bb14d80ceb
