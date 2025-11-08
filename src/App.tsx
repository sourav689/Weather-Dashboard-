import { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Loader2,
  AlertCircle,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Thermometer,
  Sunrise,
  Sunset,
  Cloud,
  CloudRain,
  Snowflake,
  Sun,
  Moon,
  Umbrella,
  Zap,
  Coffee,
  Heart,
  Home,
  Battery,
  AlertTriangle
} from 'lucide-react';
// Assuming these are placeholder components from a UI library like shadcn/ui
// In a single React file context, these are usually defined locally or assumed available.
// Since the prompt includes these imports, I'll assume they resolve or use a simple structure.

// Mock component definitions if they were not provided, to ensure runnability
const Card = ({ children, className = '' }) => <div className={`rounded-xl bg-white p-4 shadow-lg ${className}`}>{children}</div>;
const CardHeader = ({ children, className = '' }) => <div className={`flex flex-col space-y-1.5 p-0 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }) => <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardContent = ({ children, className = '' }) => <div className={`p-0 pt-0 ${className}`}>{children}</div>;
const Alert = ({ children, className = '' }) => <div className={`p-4 rounded-lg flex items-start space-x-3 ${className}`}>{children}</div>;
const AlertDescription = ({ children, className = '' }) => <div className={`text-sm [&_p]:leading-relaxed ${className}`}>{children}</div>;
const Badge = ({ children, className = '' }) => <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</span>;


interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  name: string;
  dt: number;
}

export default function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'initial' | 'prompt' | 'granted' | 'denied'>('initial');

  const API_KEY = 'ab931560e220015d8ba6eb92e6ba107f'; // API key

  const fetchWeatherData = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();

      if (response.ok) { // Check if response status is 2xx
        setWeatherData(data);
        setLocationPermissionStatus('granted'); // Set to granted if data successfully fetched
      } else {
        setError(data.message || 'Unable to fetch weather data for this location.');
        setWeatherData(null); // Clear weather data on error
      }
    } catch (err) {
      console.error('Network or API Error:', err);
      setError('Failed to fetch weather data. Please check your network connection.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }, [API_KEY]); // Dependency on API_KEY

  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLocationPermissionStatus('denied');
      return;
    }

    setLoading(true);
    setLocationPermissionStatus('prompt'); // Indicate that a prompt is (or was) active

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log('Location retrieved:', { lat, lon });
        setLocationPermissionStatus('granted'); // Explicitly set to granted here
        fetchWeatherData(lat, lon);
      },
      (err) => {
        console.error('Geolocation Error:', err);
        setError('Location access denied or blocked. Please allow location access to get current weather.');
        setLocationPermissionStatus('denied');
        setLoading(false); // Stop loading if permission is denied
        // Do NOT call fetchWeatherData here with default. Let the UI prompt the user.
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Geolocation options
    );
  }, [fetchWeatherData]); // Dependency on fetchWeatherData

  const useDefaultLocation = useCallback(() => {
    setLocationPermissionStatus('denied'); // Still mark as denied if user chose default over granting
    setError('Using default location (Mumbai) as location access was not granted.');
    fetchWeatherData(19.0760, 72.8777); // Mumbai coordinates
  }, [fetchWeatherData]);

useEffect(() => {
  // Check if geolocation is supported
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log("Current location:", { lat, lon });

        fetchWeatherData(lat, lon); // Fetch weather using actual location
        setLocationPermissionStatus('granted');
      },
      (error) => {
        console.error("Location error:", error);

        // Fallback to default location (Mumbai)
        fetchWeatherData(19.0760, 72.8777);
        setLocationPermissionStatus('denied');
        setError('Using default location (Mumbai) as location access was not granted.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    console.error("Geolocation not supported");

    fetchWeatherData(19.0760, 72.8777);
    setLocationPermissionStatus('denied');
    setError('Geolocation not supported by this browser. Using default location (Mumbai).');
  }
}, [fetchWeatherData]);



  const getWeatherIcon = (main: string, icon: string) => {
    const isNight = icon.includes('n');

    switch (main.toLowerCase()) {
      case 'clear':
        return isNight ? <Moon className="w-20 h-20 text-blue-200" /> : <Sun className="w-20 h-20 text-yellow-400" />;
      case 'clouds':
        return <Cloud className="w-20 h-20 text-gray-400" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-20 h-20 text-blue-500" />;
      case 'snow':
        return <Snowflake className="w-20 h-20 text-blue-300" />;
      case 'thunderstorm':
        return <Zap className="w-20 h-20 text-yellow-500" />;
      default:
        return <Cloud className="w-20 h-20 text-gray-400" />;
    }
  };

  /**
   * UPDATED: Adjusts temperature thresholds based on user request.
   * - Cold: Temp < 28°C
   * - Hot: Temp > 32°C
   * - Rainy/Thunder/Snowy: Based on weather main description.
   */
  const getWeatherCondition = (temp: number, weatherMain: string) => {
    if (weatherMain.toLowerCase().includes('thunder')) return 'thunder'; // More robust check
    if (weatherMain.toLowerCase().includes('rain') || weatherMain.toLowerCase().includes('drizzle')) return 'rainy';
    if (weatherMain.toLowerCase().includes('snow')) return 'snowy'; // Added snowy condition
    if (temp < 28) return 'cold'; // User requested < 28 for winter tips
    if (temp > 32) return 'hot'; // User requested > 32 for summer tips
    return 'moderate';
  };

  /**
   * UPDATED: Implements safety instructions based on user's specific winter, summer, and monsoon tips.
   */
  const getSafetyInstructions = (condition: string) => {
    switch (condition) {
      case 'cold':
        // User requested: stay mositure, eat hot and fresh, use warm woolen clother
        return [
          { icon: <Thermometer className="w-6 h-6 text-blue-500" />, text: 'Stay moisturized and protect your skin', color: 'bg-blue-50 border-blue-200' }, 
          { icon: <Coffee className="w-6 h-6 text-orange-500" />, text: 'Eat hot and fresh food to maintain body heat', color: 'bg-orange-50 border-orange-200' }, 
          { icon: <Heart className="w-6 h-6 text-red-500" />, text: 'Use warm woolen clothes and dress in layers', color: 'bg-red-50 border-red-200' }, 
        ];
      case 'hot':
        // User requested: stay hydrated, use sunscrteen fi too hot, use suncat m eat fruits etc
        return [
          { icon: <Droplets className="w-6 h-6 text-blue-500" />, text: 'Stay hydrated, drink plenty of water', color: 'bg-blue-50 border-blue-200' },
          { icon: <Sun className="w-6 h-6 text-yellow-500" />, text: 'Use sunscreen, especially if it is too hot', color: 'bg-yellow-50 border-yellow-200' }, 
          { icon: <AlertTriangle className="w-6 h-6 text-red-500" />, text: 'Wear a sun hat and eat cooling fruits', color: 'bg-red-50 border-red-200' }, 
        ];
      case 'rainy':
        // User requested: carray umebral, keep phones and devics charge, stay home if posisble
        return [
          { icon: <Umbrella className="w-6 h-6 text-blue-500" />, text: 'Carry an umbrella and wear rain gear', color: 'bg-blue-50 border-blue-200' }, 
          { icon: <Battery className="w-6 h-6 text-green-500" />, text: 'Keep phones and devices charged (emergency)', color: 'bg-green-50 border-green-200' }, 
          { icon: <Home className="w-6 h-6 text-yellow-600" />, text: 'Stay home if possible, or drive cautiously', color: 'bg-yellow-50 border-yellow-200' }, 
        ];
      case 'thunder':
        return [
          { icon: <Home className="w-6 h-6 text-red-500" />, text: 'Stay home and avoid going outside', color: 'bg-red-50 border-red-200' },
          { icon: <Zap className="w-6 h-6 text-yellow-500" />, text: 'Unplug electrical devices', color: 'bg-yellow-50 border-yellow-200' },
          { icon: <Battery className="w-6 h-6 text-green-500" />, text: 'Keep emergency devices charged', color: 'bg-green-50 border-green-200' },
        ];
      case 'snowy': // Added safety instructions for snowy
        return [
          { icon: <Snowflake className="w-6 h-6 text-blue-500" />, text: 'Dress in warm, waterproof layers', color: 'bg-blue-50 border-blue-200' },
          { icon: <Home className="w-6 h-6 text-orange-500" />, text: 'Limit outdoor exposure and stay warm', color: 'bg-orange-50 border-orange-200' },
          { icon: <AlertCircle className="w-6 h-6 text-red-500" />, text: 'Be cautious of icy roads and pathways', color: 'bg-red-50 border-red-200' },
        ];
      default:
        return [
          { icon: <Sun className="w-6 h-6 text-green-500" />, text: 'Enjoy the pleasant weather', color: 'bg-green-50 border-green-200' },
          { icon: <Heart className="w-6 h-6 text-pink-500" />, text: 'Stay active and healthy', color: 'bg-pink-50 border-pink-200' },
          { icon: <Droplets className="w-6 h-6 text-blue-500" />, text: 'Stay hydrated throughout the day', color: 'bg-blue-50 border-blue-200' },
        ];
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- Render Logic ---

  // Loading state when initially requesting location or fetching data
  if (loading && locationPermissionStatus !== 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {locationPermissionStatus === 'initial' ? 'Requesting location permission...' : 'Fetching weather data...'}
          </p>
        </div>
      </div>
    );
  }

  // If location permission is denied and no weather data has been loaded yet, show the prompt
  if (locationPermissionStatus === 'denied' && !weatherData && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <Card className="max-w-lg w-full shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-10 h-10 text-blue-600" />
            </div>
            <CardTitle className="text-3xl mb-2">Location Required</CardTitle>
            <p className="text-gray-600 text-base">To provide accurate weather, please allow location access or choose a default.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-red-50 border-l-4 border-red-400">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error || 'Location access was blocked or denied. Click below to try again or use the default.'}
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <button
                onClick={requestUserLocation}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg text-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <MapPin className="w-5 h-5" />
                Re-attempt Location Access
              </button>

              <button
                onClick={useDefaultLocation}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                Use Default Location (Mumbai)
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If there's an error and we are not in the denied state showing the prompt
  if (error && !weatherData && locationPermissionStatus === 'granted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <Alert className="bg-red-50 border-l-4 border-red-400 max-w-lg mx-auto">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error} <br/> Please try again or refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }


  // If no weather data and not loading (should ideally not happen with robust error handling)
  if (!weatherData) return null;

  const weatherCondition = getWeatherCondition(weatherData.main.temp, weatherData.weather[0].main);
  const safetyInstructions = getSafetyInstructions(weatherCondition);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4 font-inter">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Display error message if present, e.g., if API call fails after permission granted */}
        {error && locationPermissionStatus === 'granted' && (
          <Alert className="bg-yellow-50 border-yellow-300">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-2xl">
          <CardContent className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                  <MapPin className="w-6 h-6" />
                  <h1 className="text-2xl md:text-3xl">{weatherData.name}, {weatherData.sys.country}</h1>
                </div>
                <div className="flex items-baseline gap-2 justify-center md:justify-start">
                  <span className="text-7xl md:text-8xl">{Math.round(weatherData.main.temp)}°</span>
                  <span className="text-3xl">C</span>
                </div>
                <p className="mt-4 text-xl capitalize">{weatherData.weather[0].description}</p>
                <p className="mt-2 text-blue-100">Feels like {Math.round(weatherData.main.feels_like)}°C</p>
              </div>
              <div className="flex flex-col items-center gap-4">
                {getWeatherIcon(weatherData.weather[0].main, weatherData.weather[0].icon)}
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-4 py-1">
                  {weatherData.weather[0].main}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-3xl mb-6 px-2 font-serif tracking-tight">Weather Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Card className="bg-white shadow-md hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-red-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-gray-600 flex items-center gap-2 font-medium">
                  <Thermometer className="w-5 h-5 text-red-500" />
                  Feels Like
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl tracking-tight">{Math.round(weatherData.main.feels_like)}°C</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-blue-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-gray-600 flex items-center gap-2 font-medium">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  Humidity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl tracking-tight">{weatherData.main.humidity}%</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-green-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-gray-600 flex items-center gap-2 font-medium">
                  <Wind className="w-5 h-5 text-green-500" />
                  Wind Speed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl tracking-tight">{weatherData.wind.speed} <span className="text-xl text-gray-500">m/s</span></p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-purple-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-gray-600 flex items-center gap-2 font-medium">
                  <Gauge className="w-5 h-5 text-purple-500" />
                  Pressure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl tracking-tight">{weatherData.main.pressure} <span className="text-xl text-gray-500">hPa</span></p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-gray-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-gray-600 flex items-center gap-2 font-medium">
                  <Eye className="w-5 h-5 text-gray-500" />
                  Visibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl tracking-tight">{(weatherData.visibility / 1000).toFixed(1)} <span className="text-xl text-gray-500">km</span></p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-slate-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-gray-600 flex items-center gap-2 font-medium">
                  <Cloud className="w-5 h-5 text-gray-400" />
                  Cloudiness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl tracking-tight">{weatherData.clouds.all}%</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-orange-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-gray-600 flex items-center gap-2 font-medium">
                  <Sunrise className="w-5 h-5 text-orange-500" />
                  Sunrise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl tracking-tight">{formatTime(weatherData.sys.sunrise)}</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-indigo-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-gray-600 flex items-center gap-2 font-medium">
                  <Sunset className="w-5 h-5 text-indigo-500" />
                  Sunset
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl tracking-tight">{formatTime(weatherData.sys.sunset)}</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-cyan-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-gray-600 flex items-center gap-2 font-medium">
                  <Thermometer className="w-5 h-5 text-blue-400" />
                  Min Temp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl tracking-tight">{Math.round(weatherData.main.temp_min)}°C</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-rose-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-gray-600 flex items-center gap-2 font-medium">
                  <Thermometer className="w-5 h-5 text-red-500" />
                  Max Temp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl tracking-tight">{Math.round(weatherData.main.temp_max)}°C</p>
              </CardContent>
            </Card>

            {weatherData.main.sea_level && (
              <Card className="bg-white shadow-md hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-sky-400">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-gray-600 flex items-center gap-2 font-medium">
                    <Gauge className="w-5 h-5 text-blue-600" />
                    Sea Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl tracking-tight">{weatherData.main.sea_level} <span className="text-xl text-gray-500">hPa</span></p>
                </CardContent>
              </Card>
            )}

            {weatherData.main.grnd_level && (
              <Card className="bg-white shadow-md hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-emerald-400">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-gray-600 flex items-center gap-2 font-medium">
                    <Gauge className="w-5 h-5 text-green-600" />
                    Ground Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl tracking-tight">{weatherData.main.grnd_level} <span className="text-xl text-gray-500">hPa</span></p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-3xl mb-6 px-2 font-serif tracking-tight">Safety & Health Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {safetyInstructions.map((instruction, index) => (
              <Card key={index} className={`${instruction.color} border-2 shadow-md hover:shadow-xl transition-all hover:scale-105`}>
                <CardContent className="p-7">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {instruction.icon}
                    </div>
                    <p className="text-gray-800 flex-1 text-base leading-relaxed">{instruction.text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center text-gray-500 py-6">
          <p className="text-base">Last updated: {new Date(weatherData.dt * 1000).toLocaleString()}</p>
          <p className="text-sm mt-1">Latitude: {weatherData.coord.lat.toFixed(4)}, Longitude: {weatherData.coord.lon.toFixed(4)}</p>
        </div>
      </div>
    </div>
  );
}