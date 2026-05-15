# PawTrace Product Requirements

This page is the web-readable version of the uploaded PRD PDF:
[PRD.pdf](PRD.pdf).

## Product Overview

| Field | Detail |
| --- | --- |
| Product name | PawTrace |
| Product type | Smart pet vest plus mobile app |
| Target users | Urban cat and dog owners, especially busy owners who want to protect pets from getting lost and notice health problems earlier. |
| Core value | Help owners know where their pet is, identify the pet quickly if it gets lost, and monitor basic health signs in daily life. |

## User Stories And Linked Features

| User story | Linked features |
| --- | --- |
| As a pet owner, I want to see my pet's real-time location on a map, so that I can find my pet quickly if it moves away. | GPS tracking, real-time map display, movement history |
| As a pet owner, I want to set a safe area for my pet, so that I can receive an alert when my pet leaves that area. | Electronic fence, safe-zone setup, push notification alert |
| As a pet owner, I want other people to access my pet's identity information easily, so that they can contact me if they find my lost pet. | NFC pet identity card, owner contact page, pet basic information page |
| As a pet owner, I want to check my pet's heart rate, body temperature, and activity level, so that I can notice possible health problems earlier. | Health sensor data collection, health dashboard, abnormal status reminder |
| As a pet owner, I want to upload photos of visible symptoms, so that I can get a basic disease-risk suggestion before deciding whether to visit a vet. | Photo upload, AI-assisted health check, risk suggestion result |
| As a pet owner, I want the app interface to be simple and clear, so that I can use the main functions quickly in daily situations. | Simple mobile app homepage, clear navigation, map, pet profile, and health sections |

## Must-Have Features

| Feature | Requirement |
| --- | --- |
| Real-time location | Show pet location on the app map, show basic movement history, and help the owner navigate to the pet. |
| Electronic fence | Allow the owner to draw or select a safe area and send an alert when the pet leaves the safe area. |
| NFC pet identity card | Store pet name, basic traits, vaccination information, and owner contact details. Allow a finder to open the information without logging in. |
| Health monitoring | Track heart rate, body temperature, and activity level. Show data in a simple dashboard and mark abnormal data clearly. |
| AI-assisted health check | Allow users to upload a pet photo, provide a basic disease-risk suggestion, and remind users that the result is only a reference, not a medical diagnosis. |

## Initial Technical Architecture

### Front-End

| Surface | Main pages or behavior |
| --- | --- |
| Mobile app | Map page, pet profile page, health page, and AI check page. |
| Map page | Real-time location, electronic fence, and alert display. |
| Pet profile page | Pet identity, NFC information, and owner contact. |
| Health page | Heart rate, temperature, and activity level. |
| AI check page | Photo upload and result display. |
| NFC web page | Opens when a finder taps the vest with a phone, shows pet identity and owner contact information, and does not require login. |

### Back-End

| Service area | Responsibility |
| --- | --- |
| User and pet profiles | User account and pet profile management. |
| GPS data | GPS data receiving and processing. |
| Safe zones | Electronic fence alert logic. |
| Health data | Health data processing. |
| NFC identity | NFC identity page generation. |
| AI photo check | AI photo-check service connection. |

### Data Storage

| Storage type | Data |
| --- | --- |
| Database | User information, pet profile, owner contact details, GPS location history, safe-zone settings, health monitoring records, and AI health check records. |
| File storage | Uploaded pet photos and pet profile images. |

## Success Criteria

The first version of PawTrace is successful if users can:

- Find their pet's location clearly on the map.
- Set an electronic fence without confusion.
- Receive a clear alert when the pet leaves the safe area.
- Open the NFC identity card quickly without login.
- Understand basic health data such as heart rate, body temperature, and activity level.
- Upload a photo and receive a clear AI-assisted health suggestion.

## Related Product Pages

- [Feature prioritization using MoSCoW](feature-prioritization.md)
- [Product overview and module map](README.md)
