# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personal creative journalers and analog photography fans using desktop or mobile browsers to capture, develop, and keep instant-style photo strips and Polaroid prints privately on their own device.

## Product Purpose

SNAP! STUDIO is a browser-based vintage Polaroid and photobooth studio. It lets users shoot multi-frame photo strips or single instant prints via their webcam, customize them with vintage film filters, frames, captions, and stickers, and export print-ready PNGs or save them to a local keepsake gallery.

## Positioning

A 100% private, zero-upload, local-first virtual analog photobooth that delivers the tactile ritual of a vintage Polaroid and instant-film desk directly in the browser—no sign-ups, no cloud storage, and no cute/kawaii scrapbook clutter.

## Operating Context

- Runs completely client-side in React + Vite (`snap-studio/`), using WebRTC (`getUserMedia`) for live webcam capture, HTML5 Canvas for compositing/export, Web Audio API for mechanical shutter and countdown sounds, and `localStorage` for the local keepsake album.
- Core user flow: Landing page (Persuade) → Booth studio (Operate: live camera capture) → Editor (Operate: filter, frame, caption, sticker decoration & PNG/QR export) → Gallery (Experience/Operate: local saved keepsakes).

## Capabilities and Constraints

- **Capture Modes:** Single Snap (1), Classic 3-Cut (3), Studio 4-Strip (4), and 2x2 Collage (4).
- **Main Booth Desk Concept (Preserved):** 3-column studio desk layout with live developing strip preview on the left, tactile vintage camera body & viewfinder in the center, and latest instant Polaroid print preview on the right.
- **Customization & Export:** 8 color/film filters, 7 frame stock options, custom caption text, interactive drag/rotate/resize sticker overlay, high-resolution PNG download, print view, QR code modal, and local album persistence.
- **Hard Privacy Constraint:** Zero server uploads; all camera frames and exported strips remain strictly in the user's browser.
- **Studio Companion Elements:** Interactive purring studio cat mascot (`2.png`) and clickable heart-polaroids collage shortcut (`3.png`) integrated tastefully within the vintage Polaroid editorial design.

## Brand Commitments

- **Name:** SNAP! STUDIO
- **Binding Aesthetic Direction (user-stated):** Cozy cute vintage analog / Polaroid photobooth studio built on the Silver-Halide Contact Folio editorial architecture (warm cream paper, cocoa-espresso proofing mats, vintage strawberry-rose accents, pastel Polaroid paper stocks, and interactive cat companion—no generic default fonts, gradients, or palettes).

## Evidence on Hand

- Existing React application in `snap-studio/` with working camera hook (`useCamera`), audio hook (`useAudio`), countdown (`useCountdown`), canvas compositor (`canvasCompositor`), local storage (`storage`), and views (`Landing`, `Booth`, `Editor`, `Gallery`).
- No third-party testimonials, user counts, or press quotes exist; future work must not invent commercial claims.

## Product Principles

1. **Private by architecture:** Every frame stays on-device; communicate local-only privacy clearly without hype.
2. **Tactile over theatrical:** The camera, shutter, countdown, and developing strip should feel like real analog photographic equipment and print stock, not a novelty toy.
3. **Preserve the studio desk flow:** Keep the 3-column Booth workspace (strip left, camera center, Polaroid print right) intuitive and responsive across viewports.
4. **Cohesive end-to-end journey:** Landing, Booth, Editor, and Gallery share one unmistakable vintage analog/Polaroid identity.
