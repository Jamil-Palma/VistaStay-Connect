# Real-Time Hotel Search Application with NVIDIA and LlamaIndex

Welcome to the Real-Time Hotel Search App! This app enables users to find real-time information on hotels, reviews, and recent news, thanks to the powerful combination of NVIDIA technologies and LlamaIndex. The application is a submission for the **NVIDIA and LlamaIndex Developer Contest**.

---

## Overview

This app allows users to effortlessly search for hotels in different cities and neighborhoods, providing up-to-date information and reviews. Leveraging the power of NVIDIA’s NeMo Guardrails and LlamaIndex, the app delivers reliable, organized insights with high efficiency and personalization.

![App Demo Screenshot](#)  <!-- Replace this with the actual image path after uploading -->

### Key Features

- **Real-Time Information**: Fetches live hotel reviews and news from multiple sources for a comprehensive search experience.
- **User-Friendly Design**: A straightforward interface where users can seamlessly switch between locations and explore hotels.
- **Advanced Technology Integration**: Utilizes NVIDIA NeMo Guardrails and LlamaIndex for structured data and reliable insights.

## Technology Stack

- **Frontend**: React (JavaScript)
- **Backend**: Python (with Uvicorn, NVIDIA technologies, LlamaIndex)
- **NVIDIA Technologies**: 
  - **NeMo Guardrails** for filtering relevant information
- **LlamaIndex**: Organizes and structures data for quick, accurate retrieval and querying.

---

## Project Architecture

This project consists of two main directories:

- **Frontend (FE)**: Built with React, handles user interactions and displays search results.
- **Backend (BE)**: A Python-based API server that manages data processing, scraping, and integration with NVIDIA and LlamaIndex.

---

## Installation Guide

### Prerequisites

- **Node.js and npm**: Required for setting up the frontend.
- **Python 3.8+**: Necessary for the backend API.
- **Virtual Environment Tool**: `venv` is recommended to create isolated environments for the backend dependencies.

### Environment Variables

In order for the app to function, certain environment variables need to be set up.

#### Frontend (`FE/.env`)

```plaintext
REACT_APP_API_URL=http://127.0.0.1:8000
# REACT_APP_API_URL=https://c55d-181-115-171-217.ngrok-free.app
# REACT_APP_HOTEL_API_URL=http://localhost:8001
REACT_APP_HOTEL_API_URL=https://2671-181-115-171-217.ngrok-free.app
```

#### Backend (`BE/.env`)

```plaintext
OPENAI_API_KEY=your_openai_api_key
NVIDIA_API_KEY=your_nvidia_api_key
NVIDIA_API_BASE=your_nvidia_api_base_url
```

Replace placeholders with your actual API keys.

---

### Setup and Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/yourrepository.git
cd yourrepository
```

#### 2. Backend Installation

Navigate to the `BE` directory and follow these steps:

1. **Create Virtual Environments**:

   ```bash
   cd BE
   python3 -m venv env_requirements
   python3 -m venv env_requirements2
   ```

2. **Install Dependencies**:

   - For `requirements.txt`:

     ```bash
     source env_requirements/bin/activate
     pip install -r requirements.txt
     deactivate
     ```

   - For `requirements2.txt`:

     ```bash
     source env_requirements2/bin/activate
     pip install -r requirements2.txt
     deactivate
     ```

#### 3. Frontend Installation

Navigate to the `FE` directory and install dependencies:

```bash
cd ../FE
npm install
```

### Running the Application

After installation, follow these steps to start the application.

#### 1. Start the Backend

Navigate to the `BE` directory and run the backend services:

- **Run `api.py` on port 8000 using Uvicorn**:

   ```bash
   cd ../BE
   source env_requirements/bin/activate
   uvicorn api:app --reload --loop asyncio --port 8000
   ```

- **Run `guardials.py` on port 8001**:

   ```bash
   source env_requirements2/bin/activate
   python guardials.py --port 8001
   deactivate
   ```

#### 2. Start the Frontend

In a new terminal, navigate to the `FE` directory and start the React app:

```bash
cd ../FE
npm start
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

---

## Explanation of the Project

This app demonstrates an innovative approach to retrieving real-time information for travelers. By integrating **NVIDIA NeMo Guardrails** and **LlamaIndex**, the app not only pulls in the latest data but also ensures that it’s well-organized and highly relevant. Here’s a breakdown of the core components:

- **Web Scraping**: Collects fresh hotel data, news, and reviews from multiple websites.
- **Data Structuring**: LlamaIndex organizes the raw data, making it easy to search and query.
- **Information Filtering**: NVIDIA NeMo Guardrails ensures only relevant, high-quality information is displayed to the user.

This combination of technologies ensures users have the most up-to-date and organized data possible, making it easier to plan trips and choose the best hotels.

---

## Technologies Used

- **React**: Provides a responsive and interactive frontend for hotel searches.
- **Uvicorn**: A fast ASGI server to handle asynchronous requests in Python.
- **NVIDIA NeMo Guardrails**: Filters and refines the scraped data for improved relevance.
- **LlamaIndex**: Efficiently indexes and structures data for accurate retrieval.
- **Python and FastAPI**: The backend utilizes Python with FastAPI to serve data and handle API requests.

---

## Contribution

Feel free to fork this repository and contribute to the project! Please open a pull request with any new features, bug fixes, or enhancements.

---

## License

This project is open-source and available under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## Contact

For any inquiries, please reach out via GitHub Issues or contact me directly at [your.email@example.com](mailto:jbps.work@google.com).

