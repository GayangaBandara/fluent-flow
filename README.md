# Fluent Flow - Speaking Chatbot for English Learning

Fluent Flow is a React-based web application designed to help users improve their English speaking skills. The chatbot provides real-time English conversation, displays its responses, and speaks them aloud using text-to-speech functionality.

---

## 🚀 Features

- **Real-Time Conversation**: Chat with the bot and receive instant responses.
- **Text-to-Speech (TTS)**: The chatbot speaks its responses aloud for better language immersion.
- **Speech-to-Text (STT)**: Speak directly to the bot and have your speech converted into text.
- **Interactive Interface**: A user-friendly design for seamless interaction.
- **Personalized English Practice**: Perfect for improving your English speaking skills.

---

## 🛠️ Technologies Used

- **Frontend**: React.js
- **Backend/API**: OpenAI GPT API
- **Speech Functionalities**: Web Speech API (`speech-to-text`, `react-speech-kit`)
- **Styling**: CSS Modules

---

## 📁 Project Structure

```
fluent-flow/
├── package.json
├── README.md
├── public/
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
└── src/
    ├── App.css
    ├── App.js
    ├── App.test.js
    ├── index.css
    ├── index.js
    ├── logo.svg
    ├── reportWebVitals.js
    ├── setupTests.js
    ├── components/
    │   ├── Chatbot.js         # Main chatbot component
    │   ├── ChatMessage.css    # Styling for chat messages
    │   └── ChatMessage.js     # Chat message component
    └── services/
        └── chatbotAPI.js      # API service for chatbot interactions
```

---

## 🚦 Prerequisites

Before running this project, ensure you have:

- Node.js (version 14.0.0 or higher)
- npm (version 6.0.0 or higher)
- An OpenAI API key for the chatbot functionality

---

## 📥 Installation

1. Clone the repository:
```bash
git clone https://github.com/GayangaBandara/fluent-flow.git
```

2. Navigate to the project directory:
```bash
cd fluent-flow
```

3. Install dependencies:
```bash
npm install
```

4. Create a `.env` file in the root directory and add your OpenAI API key:
```
REACT_APP_OPENAI_API_KEY=your_api_key_here
```

---

## 🏃‍♂️ Running the Application

1. Start the development server:
```bash
npm start
```

2. Open your browser and visit:
```
http://localhost:3000
```

The application will automatically reload if you make changes to the source code.

---

## 📜 Available Scripts

In the project directory, you can run:

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner in interactive watch mode
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

---

## 🏗️ Building for Production

To create a production build:

```bash
npm run build
```

This creates an optimized build in the `build` folder, ready for deployment.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👏 Acknowledgments

- Create React App for the initial project setup
- OpenAI for the GPT API
- Web Speech API for speech functionality
- React community for the amazing ecosystem

---

## 📫 Contact

Gayanga Bandara - [@GayangaBandara](https://github.com/GayangaBandara)

Project Link: [https://github.com/GayangaBandara/fluent-flow](https://github.com/GayangaBandara/fluent-flow)