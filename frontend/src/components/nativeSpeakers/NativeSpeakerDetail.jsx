import React, { useContext, useState, useEffect } from 'react';
import { NativeSpeakerDetailContext } from '../../contexts/nativeSpeakerContext';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { jwtDecode } from "jwt-decode";
import { fetchNativeSpeakersDetail } from '../../services/nativeSpeakerService';

const NativeSpeakerDetail = ({ nativeSpeaker }) => {
  const nativeSpeakersDetailContext = useContext(NativeSpeakerDetailContext);
  const nativeSpeakersDetail = nativeSpeaker || nativeSpeakersDetailContext;
  const navigate = useNavigate();
  const [cookies] = useCookies(['token']);
  let userType = ''; // Initialize userType
  let decodedToken = ''; // Define decodedToken outside the if block

  // Decode token if available
  if (cookies.token) {
    const decodedToken = jwtDecode(cookies.token);
    userType = decodedToken.userType;
  }


  console.log("this user is:", userType);
  const [toggleChecked, setToggleChecked] = useState(() => {
    // Get the toggle state from localStorage if available, otherwise default to false
    return localStorage.getItem('toggleChecked') === 'true';
  });
  const [loading, setLoading] = useState(true);
  // const [nativeSpeakerData, setNativeSpeakerData] = useState(false);

  useEffect(() => {
    setLoading(false); // Set loading to false when component mounts
    // setNativeSpeakerData(fetchNativeSpeakersDetail(decodedToken.id));
  }, []);

  // Update localStorage when toggle state changes
  useEffect(() => {
    localStorage.setItem('toggleChecked', toggleChecked);
  }, [toggleChecked]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const mappedData = {
    id: nativeSpeakersDetail._id,
    username: nativeSpeakersDetail.username,
    userType: nativeSpeakersDetail.userType,
    isAvailable: nativeSpeakersDetail.isAvailable,
    language: nativeSpeakersDetail.language,
    country: nativeSpeakersDetail.country,
    description: nativeSpeakersDetail.description,
    zoomLink: nativeSpeakersDetail.zoomLink,
  };

  const handleBackBtn = () => {
    navigate('/nativeSpeakers');
  };

  const handleToggleChange = () => {
    if (cookies.token) {
      const newToggleValue = !toggleChecked; // Toggle the state
      // Make API call to update availability status
      fetch('http://localhost:4000/user/updateAvailability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${cookies.token}` // Include JWT token in headers
        },
        body: JSON.stringify({
          username: decodedToken.username,
          isAvailable: newToggleValue // Send new value to backend
        }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to update availability status');
          }
          return response.json();
        })
        .then(data => {
          setToggleChecked(newToggleValue); // Update state if API call succeeds
        })
        .catch(error => {
          console.error('Error updating availability status:', error);
          // Handle error here (e.g., show error message to user)
        });
    };
  }

  return (
    <div className="flex flex-col min-h-screen bg-customBackground">
      <main className="flex-1">
        <div className="py-12">
          <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
            <div className="bg-customDiv p-6 rounded-xl shadow-xl">
              <h2 className="text-xl font-semibold mb-4">{mappedData.username}</h2>
              <h3 className="text-lg font-semibold mb-2">Native Speaker Details:</h3>
              {/* Render toggle button if user is a native speaker */}
              {userType === 'NativeSpeaker' && (
                <button
                  className={`bg-gray-300 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded ${toggleChecked ? 'bg-blue-500' : 'bg-gray-300'}`}
                  onClick={handleToggleChange}
                >
                  {toggleChecked ? 'Available to teach!' : 'Not available'}
                </button>
              )}
              {/* Render nativeSpeaker Content */}
              {Object.entries(mappedData).map(([key, value]) => (
                key === 'password' || key === 'username' || key === 'userType' ? null :
                    <div key={key} className="mb-4">
                      {typeof value === 'object' ? (
                        <div className="ml-4">
                          {Object.entries(value).map(([nestedKey, nestedValue]) => (
                            <div key={nestedKey} className="mb-2">
                              <li><strong>{nestedKey}:</strong> {nestedValue}</li>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-700">{value}</p>
                      )}
                    </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NativeSpeakerDetail;
