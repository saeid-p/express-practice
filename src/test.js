const getCurrentTime = (date) => {
  // Get the current date and time
  // Extract hours and minutes
  let hours = date.getHours();
  const minutes = date.getMinutes();

  // Determine AM or PM suffix
  const amPm = hours >= 12 ? "PM" : "AM";

  // Convert hours to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Format minutes to always be two digits
  const minutesStr = minutes < 10 ? "0" + minutes : minutes;

  // Construct the time string
  const timeStr = `${hours}:${minutesStr} ${amPm}`;
  return timeStr;
};

const fullNameInput = document.getElementById("fullNameInput");

const yearSelect = document.getElementById("yearSelect");
yearSelect.options[0].disabled = true;
for (let i = 2024; i >= 1940; i--) {
  const option = document.createElement("option");
  option.text = i.toString();
  option.value = i.toString();
  yearSelect.add(option);
}

const monthSelect = document.getElementById("monthSelect");
monthSelect.options[0].disabled = true;

const daySelect = document.getElementById("daySelect");
daySelect.options[0].disabled = true;
for (let i = 1; i <= 31; i++) {
  const option = document.createElement("option");
  option.text = i.toString();
  option.value = i.toString();
  daySelect.add(option);
}

const hourSelect = document.getElementById("hourSelect");
hourSelect.options[0].disabled = true;
for (let i = 1; i <= 12; i++) {
  const option = document.createElement("option");
  option.text = i.toString();
  option.value = i.toString();
  hourSelect.add(option);
}

const minuteSelect = document.getElementById("minuteSelect");
minuteSelect.options[0].disabled = true;
for (let i = 0; i <= 60; i++) {
  const option = document.createElement("option");
  option.text = i.toString();
  option.value = i.toString();
  minuteSelect.add(option);
}

const timeSelect = document.getElementById("timeSelect");
timeSelect.options[0].disabled = true;

const locationSelect = document.getElementById("locationSelect");
const emailInput = document.getElementById("emailInput");

const formContainer = document.getElementById("formContainer");
const resultsContainer = document.getElementById("resultsContainer");

const codeBlock = document.querySelector("code");

const mapBoxApiKey = "sk.eyJ1IjoicmVoYWFwcCIsImEiOiJjbDMybmRlaHgyN2hiM2pvNWJyOWFhZ3prIn0.di4RX6OzcNmjVEWNhPNBBQ";
const reportApiUrl = "https://astro.rehaapp.com/getIndividualReportNoAuth";

const timeZoneApiKey = "f2a4339f00a34a1abbaa857565a05329";

const MAP_LOCATIONS = ["PISCES", "ARIES", "TAURUS", "GEMINI", "CANCER", "LEO", "VIRGO", "LIBRA", "SCORPIO", "SAGITTARIUS", "CAPRICORN", "AQUARIUS"];

const populateMap = (birthChart, topRasi) => {
  const topRasiIndex = MAP_LOCATIONS.indexOf(topRasi.toUpperCase());
  let counter = 1;

  const reportPayload = {};

  const updateElement = (i) => {
    const rasi = MAP_LOCATIONS[i];
    document.getElementById(`${rasi.toLowerCase()}-id`).innerText = counter;
    reportPayload[`${toSentenceCase(rasi)}Id`] = counter.toString();

    const rasiHouses = Object.keys(birthChart).filter((house) => house !== "ASCENDANT" && birthChart[house]["rasi"] === rasi);
    const housesFiltered = rasiHouses.map((x) => x.substring(0, 2));
    if (counter === 1) housesFiltered.unshift("ASC");

    const name = housesFiltered.join(", ");
    document.getElementById(`${rasi.toLowerCase()}-name`).innerText = name;
    reportPayload[`${toSentenceCase(rasi)}Name`] = name;
    ++counter;
  };

  for (let i = topRasiIndex; i < MAP_LOCATIONS.length; ++i) {
    updateElement(i);
  }

  for (let i = 0; i < topRasiIndex; ++i) {
    updateElement(i);
  }

  return reportPayload;
};

const isFormValid = () => {
  const data = {
    name: fullNameInput.value,
    year: yearSelect.value,
    month: monthSelect.value,
    day: daySelect.value,
    hour: hourSelect.value,
    minute: minuteSelect.value,
    time: timeSelect.value,
    location: locationSelect.value,
  };

  for (key of Object.keys(data)) {
    if (!data[key]) {
      alert(`Not all fields have been filled: ${key}`);
      return false;
    }
  }

  return true;
};

const convertToUTC = (dateObj, timeZone) => {
  // Create a date string from the provided object
  const dateString = `${dateObj.year}-${String(dateObj.month).padStart(2, "0")}-${String(dateObj.day).padStart(2, "0")}T${String(dateObj.hour).padStart(2, "0")}:${String(dateObj.minutes).padStart(2, "0")}:00`;

  const { DateTime } = luxon;
  // Parse the date string in the provided time zone
  const dateTime = DateTime.fromISO(dateString, { zone: timeZone });

  // Convert to UTC
  const utcDateTime = dateTime.toUTC();

  const utcDate = new Date(utcDateTime.toISO());

  // Return the UTC components
  return {
    year: utcDate.getUTCFullYear(),
    month: utcDate.getUTCMonth() + 1, // getUTCMonth() returns 0-11
    day: utcDate.getUTCDate(),
    hour: utcDate.getUTCHours(),
    minutes: utcDate.getUTCMinutes(),
  };
};

const getLocationSuggestions = async (query) => {
  const mapApiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapBoxApiKey}`;
  const mapApiResponse = await fetch(mapApiUrl);
  const mapJsonResponse = await mapApiResponse.json();
  return mapJsonResponse.features;
};

const getLocation = async (query) => {
  const features = await getLocationSuggestions(query);
  const updatedLocation = features[0];
  return updatedLocation;
};

const awesomplete = new Awesomplete(locationSelect, {
  minChars: 2,
  maxItems: 10,
  autoFirst: true,
});

locationSelect.addEventListener("input", async () => {
  const query = locationSelect.value;
  if (query.length >= 2) {
    const suggestions = await getLocationSuggestions(query);
    awesomplete.list = suggestions.map((x) => x.place_name);
  }
});

locationSelect.addEventListener("awesomplete-selectcomplete", async (event) => {
  const selectedLocation = event.text.value;
  locationSelect.value = selectedLocation;
});

const toSentenceCase = (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

const generateGuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const saveSession = (payloadJsonString) => {
  const sessionId = generateGuid();
  localStorage.setItem(sessionId, payloadJsonString);
  return sessionId;
};

const getBirthHour = (hour, isMorning) => {
  if (hour === 12) return isMorning ? 0 : 23;
  return hour + (isMorning ? 0 : 12);
};

const viewChartButtonClick = async (e) => {
  e.preventDefault();
  if (!isFormValid()) return;

  const birthHour = getBirthHour(parseInt(hourSelect.value), timeSelect.value === "AM");

  const updatedLocation = await getLocation(locationSelect.value);
  locationSelect.value = updatedLocation.place_name;

  const long = updatedLocation.geometry.coordinates[0];
  const lat = updatedLocation.geometry.coordinates[1];

  const timeZoneUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${long}&format=json&apiKey=${timeZoneApiKey}`;
  const timeZoneApiResponse = await fetch(timeZoneUrl);
  const timeZoneJsonResponse = await timeZoneApiResponse.json();
  const timeZone = timeZoneJsonResponse.results[0].timezone.name;

  const dobInUtc = convertToUTC(
    {
      year: parseInt(yearSelect.value),
      month: parseInt(monthSelect.value),
      day: parseInt(daySelect.value),
      hour: birthHour,
      minutes: parseInt(minuteSelect.value),
    },
    timeZone
  );

  const reportRequest = {
    persondob: dobInUtc,
    personloc: {
      long: long,
      lat: lat,
    },
  };

  const reportResponse = await fetch(reportApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reportRequest),
  });

  const report = await reportResponse.json();

  const birthChart = report.personcharts.BIRTH_CHART_CALCULATIONS;

  document.getElementById("Results-Title").innerText = `${fullNameInput.value}'s Birth Chart`;

  const birthDateString = `${yearSelect.value}/${monthSelect.value}/${daySelect.value} ${birthHour}:${minuteSelect.value}`;
  const birthDate = new Date(birthDateString);
  document.getElementById("Results-Description").innerText = `${birthDate.toDateString()}, ${getCurrentTime(birthDate)} in ${locationSelect.value}`;

  document.getElementById("House1").innerText = birthChart["ASCENDANT"]?.["house_num"];
  document.getElementById("Ruler1").innerText = toSentenceCase(birthChart["ASCENDANT"]?.["rasi"]);

  document.getElementById("House2").innerText = birthChart["SUN"]?.["house_num"];
  document.getElementById("Ruler2").innerText = toSentenceCase(birthChart["SUN"]?.["rasi"]);

  document.getElementById("House3").innerText = birthChart["MOON"]?.["house_num"];
  document.getElementById("Ruler3").innerText = toSentenceCase(birthChart["MOON"]?.["rasi"]);

  document.getElementById("House4").innerText = birthChart["MARS"]?.["house_num"];
  document.getElementById("Ruler4").innerText = toSentenceCase(birthChart["MARS"]?.["rasi"]);

  document.getElementById("House5").innerText = birthChart["MERCURY"]?.["house_num"];
  document.getElementById("Ruler5").innerText = toSentenceCase(birthChart["MERCURY"]?.["rasi"]);

  document.getElementById("House6").innerText = birthChart["JUPITER"]?.["house_num"];
  document.getElementById("Ruler6").innerText = toSentenceCase(birthChart["JUPITER"]?.["rasi"]);

  document.getElementById("House7").innerText = birthChart["VENUS"]?.["house_num"];
  document.getElementById("Ruler7").innerText = toSentenceCase(birthChart["VENUS"]?.["rasi"]);

  document.getElementById("House8").innerText = birthChart["SATURN"]?.["house_num"];
  document.getElementById("Ruler8").innerText = toSentenceCase(birthChart["SATURN"]?.["rasi"]);

  document.getElementById("House9").innerText = birthChart["RAHU"]?.["house_num"];
  document.getElementById("Ruler9").innerText = toSentenceCase(birthChart["RAHU"]?.["rasi"]);

  document.getElementById("House10").innerText = birthChart["KETU"]?.["house_num"];
  document.getElementById("Ruler10").innerText = toSentenceCase(birthChart["KETU"]?.["rasi"]);

  const topHouse = birthChart["ASCENDANT"];
  const topRasi = topHouse.rasi;
  const mapData = populateMap(birthChart, topRasi);

  formContainer.style.display = "none";
  resultsContainer.style.display = "block";

  const reportPayload = {
    username: fullNameInput.value,
    birthDate: `${birthDate.toDateString()}, ${getCurrentTime(birthDate)}`,
    birthLocation: locationSelect.value,
    ...reportRequest,
    ...birthChart,
    ...mapData,
  };

  for (let i = 1; i <= 10; ++i) {
    reportPayload[`House${i}`] = document.getElementById(`House${i}`).innerText;
    reportPayload[`Ruler${i}`] = document.getElementById(`Ruler${i}`).innerText.toUpperCase();
  }

  localStorage.setItem("Current-Chart-Data", JSON.stringify(reportPayload));
};

document.getElementById("viewChartButton").onclick = viewChartButtonClick;

const chartContainer = document.getElementById("Chart-Container");
chartContainer.style["justify-content"] = "center";
chartContainer.style["align-items"] = "center";

const websiteContainer = document.getElementById("Website-Container");
const reportCommand = document.getElementById("Report-Command");

const generateChartPdf = async () => {
  chartContainer.style["flex-flow"] = "column";
  websiteContainer.style.display = "block";
  reportCommand.style.display = "none";

  const elementClone = resultsContainer.cloneNode(true);

  chartContainer.style["flex-flow"] = "row";
  websiteContainer.style.display = "none";
  reportCommand.style.display = "block";

  const options = {
    margin: 0,
    filename: "My-Chart.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 3,
      backgroundColor: null, // Set to null to use CSS-defined background
      useCORS: true, // Enable cross-origin images
      height: 1000,
    },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };

  await html2pdf().set(options).from(elementClone).save();
};

document.getElementById("downloadChartButton").onclick = generateChartPdf;

const stripe = Stripe("pk_live_51NwpCbJzooLeuuHvFJLpSdduWOMIpgtb3oP5V42cu8cZgG3N7RpLy9bUv0FZVmtgotsYetRYw8ybSqtko7765miy00F2G2A7LW");
const priceId = "price_1PXXAgJzooLeuuHvxIB3mkFR";
const redirectUrl = "https://sophies-website-v2.webflow.io/celestial-map";

const purchaseReport = async () => {
  const dataJsonString = localStorage.getItem("Current-Chart-Data");
  const sessionId = saveSession(dataJsonString);
  localStorage.removeItem("Current-Chart-Data");

  location.href = `/celestial-map?session_id=${sessionId}`;
  // try {
  //   await stripe.redirectToCheckout({
  //     lineItems: [{ price: priceId, quantity: 1 }],
  //     mode: "payment",
  //     successUrl: `${redirectUrl}?session_id=${sessionId}`,
  //     cancelUrl: redirectUrl,
  //     clientReferenceId: sessionId,
  //   });
  // } catch (error) {
  //   console.error(error);
  // }
};

document.getElementById("purchaseReportButton").onclick = purchaseReport;

const getQueryParam = (name) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};

const downloadFile = (url, fileName) => {
  // Create a new link element
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  // Append the link to the body
  document.body.appendChild(link);

  // Trigger a click on the link to start the download
  link.click();

  // Remove the link from the document
  document.body.removeChild(link);
};

const downloadReport = async (payload) => {
  const jsonPayload = [
    {
      Name: "Username",
      Type: "string",
      Value: payload.username,
    },
    {
      Name: "BirthDate",
      Type: "string",
      Value: payload.birthDate,
    },
    {
      Name: "BirthLocation",
      Type: "string",
      Value: payload.birthLocation,
    },
  ];

  for (let i = 1; i <= 10; ++i) {
    jsonPayload.push({
      Name: `House${i}`,
      Type: "string",
      Value: payload[`House${i}`],
    });
    jsonPayload.push({
      Name: `Ruler${i}`,
      Type: "string",
      Value: payload[`Ruler${i}`],
    });
  }

  for (let i = 0; i < MAP_LOCATIONS.length; ++i) {
    const key = toSentenceCase(MAP_LOCATIONS[i]);

    const idKey = `${key}Id`;
    jsonPayload.push({
      Name: idKey,
      Type: "string",
      Value: payload[idKey],
    });

    const nameKey = `${key}Name`;
    jsonPayload.push({
      Name: nameKey,
      Type: "string",
      Value: payload[nameKey],
    });
  }

  console.log("Report Payload", jsonPayload);

  const response = await fetch("https://v2.convertapi.com/convert/docx-template/to/pdf?Secret=9uBfFwibXeNRLLFC", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Parameters: [
        {
          Name: "File",
          FileValue: {
            Url: "https://uploads-ssl.webflow.com/6645ac0c5f72a1f3952048cb/6691c22af5849526fd795ce4_Celestial-Report-Template.docx",
          },
        },
        {
          Name: "StoreFile",
          Value: true,
        },
        {
          Name: "JsonPayload",
          Value: JSON.stringify(jsonPayload),
        },
      ],
    }),
  });
  const responseJson = await response.json();
  const fileUrl = responseJson.Files[0].Url;
  downloadFile(fileUrl, "My-Report.pdf");
};

window.onload = () => {
  // Check if 'session_id' exists in the query string
  const sessionId = getQueryParam("session_id");
  if (!sessionId) return;

  const payloadJsonString = localStorage.getItem(sessionId);
  if (!payloadJsonString) return;

  const payload = JSON.parse(payloadJsonString);

  // Send the payload to PDF service...
  downloadReport(payload);
};
