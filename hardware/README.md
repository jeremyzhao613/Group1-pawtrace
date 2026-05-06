# Hardware

Firmware and hardware support files for PawTrace device work.

## Important Paths

- `m5stack/pawtrace_wifi_telemetry.ino`: Wi-Fi-first M5StickC Plus telemetry firmware.
- `m5stack/pawtrace_ble_telemetry.ino`: BLE provisioning and telemetry-era sketch.

Hardware enclosure design files live in the sibling root folder
`hardware-design/`.

## Notes

Use the exact board model expected by the firmware work: M5StickC Plus 1.1.
Do not switch to M5StickC Plus2 unless the firmware and board settings are
explicitly updated for that target.
