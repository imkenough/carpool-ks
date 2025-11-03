# College Carpool App

This is a carpooling application built with React Native and Expo. It allows users to sign up, sign in, and find rides. _repository version is built specifically for our university_

## Features

- **Authentication:** Users can sign up and sign in to their accounts using Google one-tap.
- **Post a Ride:** Users can post a ride by providing the destination, source, date, and time.
- **Ride Listing:** Users can view a list of available rides.
- **Join a Ride:** Users can join a ride by clicking on the "Join Ride" button, which will open a WhatsApp chat with the ride poster.
- **Profile:** Users can view their own profile.

## Project Structure

```
C:\Users\hanee\Desktop\carpool-ks\
├───app
│   ├───(tabs)
│   └───auth
├───assets
│   └───images
├───components
│   └───ui
├───lib
└───utils
    ├───hooks
    ├───local-storage
    ├───query
    └───states
```

- **app:** This directory contains the main application logic, including the screens and navigation.
  - **(tabs):** This directory contains the screens that are part of the tab navigation.
  - **auth:** This directory contains the authentication screens (sign-in and sign-up).
- **assets:** This directory contains the static assets of the app, such as images and fonts.
- **components:** This directory contains the reusable UI components of the app.
  - **ui:** This directory contains the basic UI components, such as buttons, inputs, and cards.
- **lib:** This directory contains the utility functions and libraries used in the app.
- **utils:** This directory contains the utility functions and hooks used in the app.
  - **hooks:** This directory contains the custom React hooks.
  - **local-storage:** This directory contains the functions for interacting with the local storage.
  - **query:** This directory contains the functions for fetching and updating data from the Supabase database.
  - **states:** This directory contains the state management logic of the app.

## Screens

- **Sign In:** This screen allows users to sign in to their accounts.
- **Sign Up:** This screen allows users to create a new account.
- **Home:** This is the main screen of the app. It allows users to create a ride request.
- **Rides:** This screen displays a list of available rides based on the user's search criteria.
- **Profile:** This screen displays the user's profile information.

## Data Flow

The app uses a client-server architecture. The client is a React Native app, and the server is a Supabase backend. The data flows as follows:

1.  The UI components dispatch actions to the state management store (Zustand).
2.  The state management store updates the state of the app.
3.  The UI components re-render based on the new state.
4.  The app uses Tanstack Query to fetch data from the Supabase database.
5.  The data is then displayed in the UI components.

## State Management

The app uses Zustand for state management. Zustand is a small, fast, and scalable state management solution for React. It is used to manage the login state of the app.

## API and Database

The app uses Supabase for its backend. Supabase is an open-source Firebase alternative that provides a PostgreSQL database, authentication, and real-time subscriptions.

The app interacts with the Supabase API using the `@supabase/supabase-js` library. The database schema is defined in the `supabase.sql` file.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js
- Expo CLI

### Environment variables

- refer `.env.example`

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/imkenough/carpool-ks
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Start the development server
    ```sh
    npx expo start
    ```

## Dependencies

- **React Native:** A framework for building native apps with React.
- **Expo:** A framework and a platform for universal React applications.
- **Supabase:** An open source Firebase alternative for building secure and scalable backends.
- **React Navigation:** Routing and navigation for your React Native apps.
- **Zustand:** A small, fast and scalable bearbones state-management solution.
- **Nativewind:** Use Tailwind CSS with React Native.
- **React Native Reusables:** Use Tailwind CSS with React Native.
- **Tanstack-Query:** Hooks for fetching, caching and updating asynchronous data in React.

## Contributors

- [@imkenough](https://github.com/imkenough)
- [@siddharth3690](https://github.com/siddharth3690)

## Support

Star this Repo :)

![174794647-0c851917-e5c9-4fb9-bf88-b61d89dc2f4f](https://github.com/user-attachments/assets/df4795f1-3181-43c7-af7f-68eb9b814d1c)
