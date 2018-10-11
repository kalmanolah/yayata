# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.3] - 2018-10-11

### Added

- Integration tests added utilizing the power of docker and cypress.

## [1.0.2] - 2018-10-08

### Removed

- All references to V1 API removed, leaving only V2 API code. Guesstimates
  indicate that over half of vuex code was removed.

## [1.0.1] - 2018-10-03

### Fixed

- Fix being unable to create performance due to broken date formatting.

### Changed

- Render "changelog" contents by ourselves, instead of allowing the GitHub API
  to do so.

## [1.0.0] - 2018-10-03

### Added

- Start keeping a changelog.
- "Changelog" section.
- 925r API v2 support.

### Changed

- Users will now be prompted to view recent changes after the service worker
  has been updated.
- The application will now check for new versions every hour, instead of on
  navigation events.

### Removed

- 925r API v1 support.