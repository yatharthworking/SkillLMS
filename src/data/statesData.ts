export interface TouristSpot {
  name: string;
  type: "temple" | "waterfall" | "market" | "viewpoint" | "trek" | "food" | "hidden-gem";
  description: string;
}

export interface City {
  name: string;
  x: number; // relative position within state (0-100)
  y: number;
  spots: TouristSpot[];
}

export interface StateData {
  id: string;
  name: string;
  capital: string;
  tagline: string;
  cities: City[];
  color: string;
}

export const statesData: Record<string, StateData> = {
  uttarakhand: {
    id: "uttarakhand",
    name: "Uttarakhand",
    capital: "Dehradun",
    tagline: "Land of the Gods",
    color: "hsl(152 55% 38%)",
    cities: [
      {
        name: "Dehradun", x: 30, y: 55,
        spots: [
          { name: "Robber's Cave", type: "hidden-gem", description: "A natural cave formation with a stream flowing through it" },
          { name: "Tapkeshwar Temple", type: "temple", description: "Ancient cave temple dedicated to Lord Shiva" },
          { name: "Paltan Bazaar", type: "market", description: "Bustling local market with street food and handicrafts" },
        ],
      },
      {
        name: "Rishikesh", x: 35, y: 65,
        spots: [
          { name: "Laxman Jhula", type: "viewpoint", description: "Iconic suspension bridge over the Ganges" },
          { name: "Triveni Ghat", type: "temple", description: "Sacred bathing ghat with evening Ganga Aarti" },
          { name: "Beatles Ashram", type: "hidden-gem", description: "Abandoned ashram with graffiti art in the jungle" },
        ],
      },
      {
        name: "Haridwar", x: 30, y: 75,
        spots: [
          { name: "Har Ki Pauri", type: "temple", description: "Sacred ghat where the Ganges enters the plains" },
          { name: "Mansa Devi Temple", type: "temple", description: "Hilltop temple with panoramic city views" },
          { name: "Choti Bazaar", type: "market", description: "Famous for sweets, handicrafts and religious items" },
        ],
      },
      {
        name: "Mussoorie", x: 20, y: 45,
        spots: [
          { name: "Kempty Falls", type: "waterfall", description: "Spectacular waterfall surrounded by mountains" },
          { name: "Gun Hill", type: "viewpoint", description: "Second highest point with Himalayan panorama" },
          { name: "Mall Road", type: "market", description: "Colonial-era promenade with shops and cafes" },
        ],
      },
      {
        name: "Kedarnath", x: 55, y: 30,
        spots: [
          { name: "Kedarnath Temple", type: "temple", description: "One of the twelve Jyotirlingas at 3,583m altitude" },
          { name: "Vasuki Tal Trek", type: "trek", description: "Glacial lake trek at 4,135m with stunning views" },
          { name: "Chorabari Tal", type: "viewpoint", description: "Also known as Gandhi Sarovar, a pristine glacial lake" },
        ],
      },
      {
        name: "Auli", x: 65, y: 40,
        spots: [
          { name: "Auli Ski Resort", type: "trek", description: "Premier skiing destination with Nanda Devi views" },
          { name: "Gorson Bugyal", type: "viewpoint", description: "Lush alpine meadow with panoramic Himalayan views" },
          { name: "Chattrakund Lake", type: "hidden-gem", description: "Heart-shaped artificial lake surrounded by oaks" },
        ],
      },
    ],
  },
  rajasthan: {
    id: "rajasthan",
    name: "Rajasthan",
    capital: "Jaipur",
    tagline: "Land of Kings",
    color: "hsl(25 95% 58%)",
    cities: [
      {
        name: "Jaipur", x: 55, y: 45,
        spots: [
          { name: "Amber Fort", type: "viewpoint", description: "Majestic hilltop fort with stunning architecture" },
          { name: "Hawa Mahal", type: "viewpoint", description: "Palace of Winds with 953 small windows" },
          { name: "Johari Bazaar", type: "market", description: "Famous for precious gems and traditional jewelry" },
        ],
      },
      {
        name: "Udaipur", x: 30, y: 65,
        spots: [
          { name: "City Palace", type: "viewpoint", description: "Magnificent palace complex on Lake Pichola" },
          { name: "Lake Pichola", type: "viewpoint", description: "Scenic lake surrounded by hills and palaces" },
          { name: "Dal-Baati-Churma", type: "food", description: "Traditional Rajasthani cuisine experience" },
        ],
      },
      {
        name: "Jaisalmer", x: 15, y: 40,
        spots: [
          { name: "Jaisalmer Fort", type: "viewpoint", description: "Living fort rising from the Thar Desert sands" },
          { name: "Sam Sand Dunes", type: "hidden-gem", description: "Golden desert dunes for camel safaris and camping" },
          { name: "Patwon Ki Haveli", type: "viewpoint", description: "Intricate sandstone mansions with finest carvings" },
        ],
      },
      {
        name: "Jodhpur", x: 25, y: 50,
        spots: [
          { name: "Mehrangarh Fort", type: "viewpoint", description: "One of India's largest forts overlooking the Blue City" },
          { name: "Clock Tower Market", type: "market", description: "Vibrant market for spices, textiles, and handicrafts" },
          { name: "Mirchi Vada", type: "food", description: "Jodhpur's iconic spicy snack — a must try!" },
        ],
      },
    ],
  },
  kerala: {
    id: "kerala",
    name: "Kerala",
    capital: "Thiruvananthapuram",
    tagline: "God's Own Country",
    color: "hsl(152 55% 38%)",
    cities: [
      {
        name: "Kochi", x: 45, y: 35,
        spots: [
          { name: "Chinese Fishing Nets", type: "viewpoint", description: "Iconic cantilevered fishing nets from the 14th century" },
          { name: "Fort Kochi", type: "hidden-gem", description: "Charming colonial streets with art galleries and cafes" },
          { name: "Jew Town", type: "market", description: "Antique shops and spice markets in historic quarter" },
        ],
      },
      {
        name: "Munnar", x: 55, y: 40,
        spots: [
          { name: "Tea Plantations", type: "viewpoint", description: "Endless rolling hills covered in emerald tea gardens" },
          { name: "Eravikulam National Park", type: "trek", description: "Home to the endangered Nilgiri Tahr" },
          { name: "Attukal Waterfalls", type: "waterfall", description: "Cascading waterfall amidst tea plantation hills" },
        ],
      },
      {
        name: "Alleppey", x: 35, y: 45,
        spots: [
          { name: "Backwater Cruise", type: "hidden-gem", description: "Houseboat journey through serene palm-lined canals" },
          { name: "Alappuzha Beach", type: "viewpoint", description: "Beautiful beach with historic pier and lighthouse" },
          { name: "Kerala Sadhya", type: "food", description: "Traditional banana leaf feast with 24+ dishes" },
        ],
      },
      {
        name: "Wayanad", x: 40, y: 15,
        spots: [
          { name: "Edakkal Caves", type: "hidden-gem", description: "Petroglyphs from the Neolithic era in natural rock caves" },
          { name: "Chembra Peak", type: "trek", description: "Heart-shaped lake atop the highest peak in Wayanad" },
          { name: "Soochipara Falls", type: "waterfall", description: "Three-tiered waterfall in dense tropical forest" },
        ],
      },
    ],
  },
  goa: {
    id: "goa",
    name: "Goa",
    capital: "Panaji",
    tagline: "Pearl of the Orient",
    color: "hsl(199 89% 48%)",
    cities: [
      {
        name: "Panaji", x: 40, y: 30,
        spots: [
          { name: "Fontainhas", type: "hidden-gem", description: "Latin Quarter with colorful Portuguese heritage homes" },
          { name: "Church of Our Lady", type: "temple", description: "Baroque church in the heart of Old Goa" },
          { name: "Fish Thali", type: "food", description: "Authentic Goan fish curry rice experience" },
        ],
      },
      {
        name: "Calangute", x: 35, y: 25,
        spots: [
          { name: "Calangute Beach", type: "viewpoint", description: "Queen of Beaches — Goa's most popular beach" },
          { name: "Saturday Night Market", type: "market", description: "Vibrant flea market with live music and food" },
        ],
      },
      {
        name: "Palolem", x: 50, y: 80,
        spots: [
          { name: "Palolem Beach", type: "viewpoint", description: "Crescent-shaped beach with calm waters" },
          { name: "Butterfly Beach", type: "hidden-gem", description: "Secluded beach accessible only by boat" },
        ],
      },
    ],
  },
  "himachal-pradesh": {
    id: "himachal-pradesh",
    name: "Himachal Pradesh",
    capital: "Shimla",
    tagline: "Dev Bhoomi — Land of Gods",
    color: "hsl(199 89% 48%)",
    cities: [
      {
        name: "Shimla", x: 50, y: 55,
        spots: [
          { name: "The Ridge", type: "viewpoint", description: "Open space in the heart of Shimla with mountain views" },
          { name: "Mall Road", type: "market", description: "Colonial-era shopping street with charm" },
        ],
      },
      {
        name: "Manali", x: 40, y: 30,
        spots: [
          { name: "Solang Valley", type: "trek", description: "Adventure sports hub with paragliding and skiing" },
          { name: "Old Manali", type: "hidden-gem", description: "Bohemian cafes and ancient temples by the river" },
          { name: "Hadimba Temple", type: "temple", description: "Ancient cave temple in cedar forest" },
        ],
      },
      {
        name: "Dharamshala", x: 30, y: 20,
        spots: [
          { name: "McLeod Ganj", type: "hidden-gem", description: "Little Lhasa — home of the Dalai Lama" },
          { name: "Triund Trek", type: "trek", description: "Popular overnight trek with Dhauladhar views" },
          { name: "Bhagsu Waterfall", type: "waterfall", description: "Beautiful waterfall near McLeod Ganj" },
        ],
      },
      {
        name: "Kasol", x: 38, y: 25,
        spots: [
          { name: "Kheerganga Trek", type: "trek", description: "Trek to natural hot springs in the mountains" },
          { name: "Parvati Valley", type: "viewpoint", description: "Stunning valley with hippie village culture" },
          { name: "Israeli Cafes", type: "food", description: "Unique fusion food culture in the valley" },
        ],
      },
    ],
  },
  "tamil-nadu": {
    id: "tamil-nadu",
    name: "Tamil Nadu",
    capital: "Chennai",
    tagline: "Land of Temples",
    color: "hsl(0 70% 50%)",
    cities: [
      {
        name: "Chennai", x: 60, y: 25,
        spots: [
          { name: "Marina Beach", type: "viewpoint", description: "One of the longest urban beaches in the world" },
          { name: "Kapaleeshwarar Temple", type: "temple", description: "Dravidian architecture masterpiece" },
          { name: "Filter Coffee", type: "food", description: "Iconic South Indian coffee culture" },
        ],
      },
      {
        name: "Madurai", x: 50, y: 70,
        spots: [
          { name: "Meenakshi Temple", type: "temple", description: "Iconic temple with thousands of colorful sculptures" },
          { name: "Jigarthanda", type: "food", description: "Famous cold dessert drink unique to Madurai" },
        ],
      },
      {
        name: "Ooty", x: 30, y: 60,
        spots: [
          { name: "Nilgiri Mountain Railway", type: "hidden-gem", description: "UNESCO heritage toy train through tea estates" },
          { name: "Botanical Gardens", type: "viewpoint", description: "Lush 22-hectare garden with rare plant species" },
        ],
      },
    ],
  },
};

// Simplified SVG path data for Indian states
// These are approximate outlines for illustration
export const statesPaths: Record<string, { d: string; labelX: number; labelY: number }> = {
  "jammu-kashmir": { d: "M200,30 L260,20 L300,50 L310,90 L280,120 L240,110 L210,80 L190,60 Z", labelX: 250, labelY: 65 },
  "himachal-pradesh": { d: "M240,110 L280,120 L290,145 L260,160 L230,150 L220,125 Z", labelX: 255, labelY: 135 },
  "punjab": { d: "M210,130 L230,150 L240,170 L220,185 L195,170 L190,145 Z", labelX: 215, labelY: 160 },
  "uttarakhand": { d: "M260,120 L310,110 L330,140 L310,170 L280,175 L260,160 Z", labelX: 290, labelY: 145 },
  "haryana": { d: "M220,170 L250,165 L265,185 L255,210 L230,210 L215,195 Z", labelX: 240, labelY: 190 },
  "delhi": { d: "M248,195 L258,192 L262,200 L255,205 L248,200 Z", labelX: 255, labelY: 198 },
  "rajasthan": { d: "M140,180 L215,195 L230,210 L240,260 L220,310 L170,330 L120,300 L100,250 L110,200 Z", labelX: 170, labelY: 260 },
  "uttar-pradesh": { d: "M255,195 L310,170 L370,190 L400,210 L380,250 L340,270 L300,260 L260,250 L240,230 Z", labelX: 320, labelY: 225 },
  "gujarat": { d: "M80,260 L120,300 L130,340 L115,380 L80,390 L55,360 L40,310 L50,280 Z", labelX: 85, labelY: 330 },
  "madhya-pradesh": { d: "M200,280 L260,250 L340,270 L360,300 L340,340 L280,350 L220,330 L190,310 Z", labelX: 275, labelY: 305 },
  "bihar": { d: "M400,210 L450,200 L470,225 L450,245 L410,240 L390,230 Z", labelX: 430, labelY: 222 },
  "jharkhand": { d: "M390,240 L430,245 L450,265 L430,290 L400,280 L380,260 Z", labelX: 415, labelY: 265 },
  "west-bengal": { d: "M440,230 L470,225 L480,260 L470,310 L450,340 L435,310 L430,280 Z", labelX: 455, labelY: 280 },
  "odisha": { d: "M380,290 L420,280 L440,310 L430,350 L400,370 L370,340 L360,310 Z", labelX: 400, labelY: 325 },
  "chhattisgarh": { d: "M340,290 L380,290 L370,340 L360,370 L330,360 L310,330 L320,300 Z", labelX: 345, labelY: 330 },
  maharashtra: { d: "M150,340 L220,330 L280,350 L310,380 L290,420 L240,440 L180,420 L140,390 Z", labelX: 225, labelY: 385 },
  "telangana": { d: "M280,380 L330,360 L360,380 L350,420 L310,430 L280,415 Z", labelX: 318, labelY: 395 },
  "andhra-pradesh": { d: "M290,420 L350,420 L380,380 L410,400 L400,450 L360,480 L310,470 L280,450 Z", labelX: 340, labelY: 445 },
  "karnataka": { d: "M180,420 L240,440 L280,450 L270,500 L240,530 L200,520 L170,480 L160,440 Z", labelX: 220, labelY: 480 },
  goa: { d: "M160,440 L175,435 L180,460 L168,470 L155,460 Z", labelX: 167, labelY: 452 },
  kerala: { d: "M195,510 L220,530 L215,570 L200,600 L185,590 L180,550 L185,520 Z", labelX: 200, labelY: 555 },
  "tamil-nadu": { d: "M230,500 L280,470 L320,490 L310,540 L280,570 L240,560 L220,530 Z", labelX: 270, labelY: 525 },
  "north-east": { d: "M490,180 L540,160 L570,180 L560,220 L530,240 L500,230 L480,210 Z", labelX: 525, labelY: 200 },
  sikkim: { d: "M460,185 L475,178 L480,195 L470,200 L458,195 Z", labelX: 469, labelY: 190 },
};

export const stateNames: Record<string, string> = {
  "jammu-kashmir": "J&K",
  "himachal-pradesh": "Himachal",
  punjab: "Punjab",
  uttarakhand: "Uttarakhand",
  haryana: "Haryana",
  delhi: "Delhi",
  rajasthan: "Rajasthan",
  "uttar-pradesh": "UP",
  gujarat: "Gujarat",
  "madhya-pradesh": "MP",
  bihar: "Bihar",
  jharkhand: "Jharkhand",
  "west-bengal": "W. Bengal",
  odisha: "Odisha",
  chhattisgarh: "Chhattisgarh",
  maharashtra: "Maharashtra",
  telangana: "Telangana",
  "andhra-pradesh": "AP",
  karnataka: "Karnataka",
  goa: "Goa",
  kerala: "Kerala",
  "tamil-nadu": "Tamil Nadu",
  "north-east": "North East",
  sikkim: "Sikkim",
};
