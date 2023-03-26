# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Optional parser to generate and cache blocks based on a simple template format 

## [1.0.0] - 2023-03-26

### Added

- Support for parameter paths (for example "params.first-level.second-level.third-level")
- Default block classes and Block interface for custom classes
- Support for raw and escaped parameters through the Placeholder block
- Automated tests for Block class functionalities
- Building tools to generate dist files
- Simple examples page