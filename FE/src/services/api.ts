import axios, { CancelToken } from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export const runSearch = async (subject: string, customFolderName: string) => {
  const response = await api.post('/run_search/', {
    subject,
    model_name: 'meta/llama-3.1-8b-instruct',
    custom_folder_name: customFolderName,
  });
  return response.data;
};

export const convertToJson = async (inputFilePath: string, outputFilePath: string) => {
  const response = await api.post('/convert_to_json/', {
    input_file_path: inputFilePath,
    output_file_path: outputFilePath,
  });
  return response.data;
};

export const startScraping = async (jsonFilePath: string, outputSubfolder: string) => {
  const response = await api.post('/start_scraping/', {
    json_file_path: jsonFilePath,
    output_subfolder: outputSubfolder,
  });
  return response.data;
};

// src/services/api.ts

export const runSimpleSearch = async (subject: string, cancelToken?: CancelToken) => {
  console.log("subject ----------------- ", subject);
  return await axios.post(`${process.env.REACT_APP_API_URL}/run_simple_search_duck/`, { subject }, { cancelToken });
};

export const scrapeContent = async (url: string, folderUUID: string) => {
  return await axios.post(`${process.env.REACT_APP_API_URL}/simple_scraping/`, { url, folderUUID });
};

export const startTravelPlan = async (
  locationName: string,
  folderUUID: string,
  urls: string[],
  cancelToken?: CancelToken
) => {
  return await axios.post(
    `${process.env.REACT_APP_API_URL}/start_travel_plan/`,
    { locationName, folderUUID, urls },
    { cancelToken }
  );
};

// Nueva función para analizar datos
export const analyzeData = async (folderUUID: string, query: string) => {
  return await axios.post(`${process.env.REACT_APP_API_URL}/analyze_data/`, { folderUUID, query });
};

export const generateHotelInfo = async (uuid: string) => {
  return await axios.post(`${process.env.REACT_APP_HOTEL_API_URL}/generate_hotel_info/`, { uuid });
};
