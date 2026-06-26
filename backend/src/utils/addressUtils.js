/**
 * Parses and formats address data to strictly match the Mongoose addressSchema.
 * Supports receiving a single object with all fields or separate name, lat, and lng fields.
 */
const parseAddressData = (addressOrObject, latField, lngField) => {
    let name = "Unknown";
    let latitude = 0;
    let longitude = 0;

    // Handle case where address is passed as a single object (e.g., from Orders)
    if (typeof addressOrObject === 'object' && addressOrObject !== null) {
        name = addressOrObject.name || addressOrObject.address || "Unknown";
        
        // If coordinates exist on the object, validate them
        if (addressOrObject.latitude !== undefined || addressOrObject.longitude !== undefined) {
            const parsedLat = Number(addressOrObject.latitude);
            const parsedLng = Number(addressOrObject.longitude);
            
            if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng) ||
                parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
                throw new Error("Invalid coordinates: latitude must be -90..90 and longitude -180..180");
            }
            latitude = parsedLat;
            longitude = parsedLng;
        }
    } 
    // Handle case where address is a string and coordinates might be separate (e.g., from Restaurants)
    else {
        if (typeof addressOrObject === 'string' && addressOrObject.trim() !== '') {
            name = addressOrObject;
        }

        if (latField !== undefined || lngField !== undefined) {
            const parsedLat = Number(latField);
            const parsedLng = Number(lngField);
            
            if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng) ||
                parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
                throw new Error("Invalid coordinates: latitude must be -90..90 and longitude -180..180");
            }
            latitude = parsedLat;
            longitude = parsedLng;
        }
    }

    return { name, latitude, longitude };
};

module.exports = {
    parseAddressData
};
