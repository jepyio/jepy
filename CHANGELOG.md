# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

-   Optional parser to generate and cache blocks based on a simple template format

## [1.3.4] - 2023-12-30

### Added

-   jepy.Indented to indent rendered blocks. The rendered content of the Block provided to this will be returned indented

## [1.3.3] - 2023-12-27

### Changed

-   use the built in private class field format

## [1.3.2] - 2023-04-02

### Fixed

-   module settings and added a section to README about using this as a module

## [1.3.1] - 2023-03-27

### Changed

-   the Block interface to be public

## [1.3.0] - 2023-03-30

### Added

-   jepy.Cached to cache rendered blocks. This will return the cached value on subsequent render requests, which you may verify against if you want it to be updated.

## [1.2.1] - 2023-03-28

### Changed

-   Improved the "Usage" part of the README

## [1.2.0] - 2023-03-27

### Changed

-   Removed matchAll dependency for better browser support

## [1.1.1] - 2023-03-27

### Fixed

-   JSDoc param types and visibility

## [1.1.0] - 2023-03-27

### Added

-   The Callback block for more complex use cases. This will return the text produced by the callback function that was passed on initialisation
-   More examples and CDN link for the README usage section

### Fixed

-   Terser regex setting to the format to mangle private properties

## [1.0.1] - 2023-03-26

### Added

-   Examples for each block in the README "Usage" section

### Fixed

-   Grammar in the "Usage" section

## [1.0.0] - 2023-03-26

### Added

-   Support for parameter paths (for example "params.first-level.second-level.third-level")
-   Default block classes and Block interface for custom classes
-   Support for raw and escaped parameters through the Placeholder block
-   Automated tests for Block class functionalities
-   Building tools to generate dist files
-   Simple examples page
