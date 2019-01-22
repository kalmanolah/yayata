# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.7] - 2019-01-22

### Added

- On the month view, pending leave is now shown.

- Hours worked on the month view can now be expanded to show a breakdown of
  hours worked per contract, leave taken, etc.

## [1.0.6] - 2019-01-16

### Fixed

- When your access token expires and multiple requests are pending, multiple
  refreshes will no longer be attempted. Previously this would cause all but
  the first refresh to fail, causing you to be logged out.

## [1.0.5] - 2018-11-09

### Changed

- When bulk adding a contract is no longer be selected by default. This should
  prevent people from accidentally adding 20-ish performances to the wrong
  contract.

## [1.0.4] - 2018-10-23

### Changed

- When importing performance linked to a contract without explicitly defined
  performance types, we now fall back to allowing all performance types
  instead of not allowing the import.

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