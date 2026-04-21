export const CITIES = [
  { name: "Bangalore", slug: "bangalore", areas: ["Koramangala", "Whitefield", "HSR Layout", "Jayanagar", "Electronic City", "Indiranagar", "Hebbal", "Yeshwanthpur"] },
  { name: "Mumbai",    slug: "mumbai",    areas: ["Andheri", "Bandra", "Kurla", "Thane", "Navi Mumbai", "Worli", "Borivali", "Malad"] },
  { name: "Delhi",     slug: "delhi",     areas: ["Connaught Place", "Dwarka", "Rohini", "Saket", "Noida", "Gurugram", "Faridabad", "Lajpat Nagar"] },
  { name: "Chennai",   slug: "chennai",   areas: ["T Nagar", "Anna Nagar", "Velachery", "Porur", "Tambaram", "Adyar", "Perambur", "Guindy"] },
  { name: "Hyderabad", slug: "hyderabad", areas: ["Hitech City", "Gachibowli", "Banjara Hills", "Kukatpally", "Secunderabad", "Kondapur", "Madhapur"] },
  { name: "Pune",      slug: "pune",      areas: ["Viman Nagar", "Hinjewadi", "Kothrud", "Baner", "Wakad", "Hadapsar", "Koregaon Park", "Pimpri", "Chinchwad"] },
  { name: "Kolkata",   slug: "kolkata",   areas: ["Salt Lake", "Park Street", "Howrah", "Dum Dum", "Rajarhat", "Ballygunge", "Behala"] },
  { name: "Ahmedabad", slug: "ahmedabad", areas: ["Navrangpura", "Satellite", "Vastrapur", "Maninagar", "Bopal", "Chandkheda", "Gota"] },
  { name: "Mysore",    slug: "mysore",    areas: ["Vijayanagar", "Kuvempunagar", "Hebbal", "Nazarbad", "Gokulam", "Yadavagiri"] },
  { name: "Surat",     slug: "surat",     areas: ["Adajan", "Vesu", "Athwa", "Katargam", "Varachha", "Rander", "Althan"] }
]

export const CITY_NAMES = CITIES.map(c => c.name)

export function getCityAreas(cityName) {
  const city = CITIES.find(c => c.name === cityName)
  return city ? city.areas : []
}