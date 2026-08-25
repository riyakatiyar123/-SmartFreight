India's freight industry is worth ₹7 lakh crore.

Most of it still runs on phone calls, WhatsApp 
groups, and personal contacts.

Shippers have no price visibility.
Transporters have no direct access to customers.
Nobody knows where the truck is.

I built SmartFreight to fix that.


WHAT IT DOES

Shippers post a freight requirement.
Transporters bid competitively in real time.
Shipper picks the best bid.
Goods move. Truck is tracked live.

That's it. Clean, transparent, digital.

HOW IT WORKS — UNDER THE HOOD

→ Shippers and transporters have completely 
  separate dashboards and permissions

→ Bids appear on the shipper's screen instantly 
  — no page refresh — using Socket.IO WebSockets

→ A trip cost analyzer helps transporters 
  calculate fuel, toll, driver cost and suggests 
  3 bid strategies with estimated win probability

→ Live GPS tracking updates truck location 
  every 10 seconds via WebSockets on a Leaflet map

→ After delivery, shipper rates the transporter 
  — rating updates automatically on their profile

  Authentication

- User registration

- User login

- Role-based access

- Shipper and transporter accounts

- Protected dashboard

- Logout functionality

- Bidding System

Transporters can place bids on available shipments.

Shippers can:

- View received bids

- Compare bid amounts

- View transporter information

- Accept/reject bids

Transporters can:

- View their placed bids

- Track bid status

- View the related shipment

  home page <img width="1469" height="864" alt="Screenshot 2026-08-25 at 08 26 11" src="https://github.com/user-attachments/assets/aef9d1e6-5802-4b08-a095-0f0d3e4c01e4" />

  about page 
  <img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 26 20" src="https://github.com/user-attachments/assets/fb4b3276-feb4-4123-82ce-439268567ea0" />

contact us <img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 28 26" src="https://github.com/user-attachments/assets/672617c4-5c03-4688-83b2-cafb2c37fee3" />
learn more <img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 26 36" src="https://github.com/user-attachments/assets/80d7db62-2806-4977-a3c2-ecfccf0a4c9c" />
Login Page

Users can log in using their registered credentials.<img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 29 20" src="https://github.com/user-attachments/assets/99858a47-48e9-444c-8c52-fb1427ed544a" />
Registration Page

New users can create an account and select their role.

Roles:

* Shipper
  <img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 26 44" src="https://github.com/user-attachments/assets/b8705a09-8f6c-4b7d-bb26-4a0142b8a0ad" />

* Transporter <img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 26 50" src="https://github.com/user-attachments/assets/871414fc-8b70-4647-92a6-7c2f80c0b68b" />
<img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 27 01" src="https://github.com/user-attachments/assets/242b36d4-b384-44a7-9bbf-a769133a925f" />


Shipper Dashboard

The shipper dashboard allows users to:

* View their shipments
* View bids
* Track shipments
* View delivered shipments
* Cancel posted shipments
* Create new shipments
  <img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 30 43" src="https://github.com/user-attachments/assets/091822fe-e04c-4281-933e-7cba329ae540" />

  Transporter Dashboard

The transporter dashboard allows users to:

* View available shipments
* Place bids
* View active deliveries
* View completed deliveries
* Track their bids
* <img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 31 51" src="https://github.com/user-attachments/assets/ff7e49ba-40f7-4f82-8c25-11731bf436f0" />

Create Shipment

Shippers can create a new shipment by entering shipment details.

Information includes:

* From location
* To location
* Weight
* Amount
* Shipment details
 <img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 32 29" src="https://github.com/user-attachments/assets/431bd64c-9bfb-474e-9286-15830264489a" />
<img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 32 22" src="https://github.com/user-attachments/assets/eb56b6f3-f69f-4d0d-b73d-f9ecf6c5b0b0" />


Trip Cost Analyzer

<img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 35 27" src="https://github.com/user-attachments/assets/ba036604-aeb6-468f-8d16-4fded77642a7" />
<img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 35 34" src="https://github.com/user-attachments/assets/35b4b684-d6f1-4d68-876e-79f8484a83a9" />
<img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 35 41" src="https://github.com/user-attachments/assets/84f65467-f617-42c3-beb0-e44178d95798" />


Bids Received 
<img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 37 04" src="https://github.com/user-attachments/assets/c8a0c019-adff-4475-ba4b-f15a18c9d01b" />



Delivery Tracking

Once a shipment is assigned to a transporter, its status can be tracked through different stages:

pick up and live tracking 
<img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 37 55" src="https://github.com/user-attachments/assets/0e273b84-3d3e-439e-862c-a7bf7f743f8c" />
<img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 38 08" src="https://github.com/user-attachments/assets/1a0ebedd-bb57-4148-83e1-0a7814eb518f" />

Reached Destination notification 
<img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 38 48" src="https://github.com/user-attachments/assets/a265a3d4-c959-4c79-9d57-9d859d0b4018" />


Your Goods Have Been Delivered notification
<img width="1470" height="956" alt="Screenshot 2026-08-25 at 08 39 25" src="https://github.com/user-attachments/assets/cff7069f-b961-435a-99bd-b1f8e1fa856c" />

Tech Stack

Frontend

* React.js
* React Router
* JavaScript
* HTML5
* CSS3

Backend

* Node.js
* Express.js

Database

* PostgreSQL

Authentication

* JWT
* bcrypt

API

* Axios

Development Tools

* Git
* GitHub
* VS Code
* npm

