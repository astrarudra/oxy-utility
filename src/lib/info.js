function getDeviceType() {
    const width = window.screen.width;
    const height = window.screen.height;
    
    if (width >= 1024 && height >= 768) {
        return "Desktop/Laptop";
    } else if (width >= 600 && width < 1024) {
        return "Tablet";
    } else {
        return "Mobile";
    }
}

function getOrientation() {
    if (window.matchMedia("(orientation: landscape)").matches) {
        return "Landscape";
    } else {
        return "Portrait";
    }
}

function getDeviceInfo() {
    const deviceInfo = {
        deviceType: getDeviceType(),
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        devicePixelRatio: window.devicePixelRatio,
        orientation: getOrientation()
    };

    return deviceInfo;
}

function getBrowserInfo() {
    const browserInfo = {
        userAgent: navigator.userAgent,
        appName: navigator.appName,
        appVersion: navigator.appVersion,
        platform: navigator.platform,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        online: navigator.onLine,
        doNotTrack: navigator.doNotTrack
    };
    return browserInfo;
}

async function getLocationInfo() {
    let locationInfo = {
        latitude: null,
        longitude: null,
        ipAddress: null
    };

    // Get location coordinates
    if ("geolocation" in navigator) {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        }).catch(() => {});

        if (position) {
            locationInfo.latitude = position.coords.latitude;
            locationInfo.longitude = position.coords.longitude;
        }
    }

    // Get IP address
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        locationInfo.ipAddress = data.ip;
    } catch (error) {}

    return locationInfo;
}

function getInternetSpeed() {
    if ("connection" in navigator && "downlink" in navigator.connection) {
        const speedMbps = navigator.connection.downlink;
        return {internetSpeed: speedMbps + "Mbps"};
    } else {
        return {};
    }
}

const getAllInfo = async () => {
    const deviceInfo = getDeviceInfo();
    const browserInfo = getBrowserInfo();
    const locationInfo = await getLocationInfo()
    const internetSpeed = getInternetSpeed();
    return { ...browserInfo, ...deviceInfo, ...locationInfo, ...internetSpeed };
}

export { getAllInfo, getDeviceInfo, getBrowserInfo, getLocationInfo, getInternetSpeed, getDeviceType, getOrientation }