# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Optional parser to generate and cache blocks based on a simple template format 

## [1.1.0] - 2023-03-27

### Added

- The Callback block for more complex use cases. This will return the text produced by the callback function that was passed on initialisation

### Fixed

- Terser regex setting to the format to mangle private properties

## [1.0.1] - 2023-03-26

### Added

- Examples for each block in the README "Usage" section

### Fixed

- Grammar in the "Usage" section

## [1.0.0] - 2023-03-26

### Added

- Support for parameter paths (for example "params.first-level.second-level.third-level")
- Default block classes and Block interface for custom classes
- Support for raw and escaped parameters through the Placeholder block
- Automated tests for Block class functionalities
- Building tools to generate dist files
- Simple examples page