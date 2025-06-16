// Mock API URL (Replace with your actual API endpoint)
const API_URL = 'https://your-api-endpoint.com/data';

// Function to fetch data from the backend
export const fetchData = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Error fetching data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Function to add new data to the backend
export const addData = async (newEntry) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEntry),
    });
    if (!response.ok) {
      throw new Error('Error adding data');
    }
    const addedEntry = await response.json();
    return addedEntry;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Function to update existing data on the backend
export const updateData = async (updatedEntry) => {
  try {
    const response = await fetch(`${API_URL}/${updatedEntry.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedEntry),
    });
    if (!response.ok) {
      throw new Error('Error updating data');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.export = {addData,fetchData,updateData};