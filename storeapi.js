(function(global) {
    function fetchAllItems(callback, fallback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "list.json", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback(JSON.parse(xhr.responseText));
            } else if (xhr.readyState === 4 && xhr.status !== 200) {
                fallback();
            }
        };
        xhr.send();
    }

    function fetchItem(id, callback, fallback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", id + "/list.json", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback(JSON.parse(xhr.responseText));
            } else if (xhr.readyState === 4 && xhr.status !== 200) {
                fallback();
            }
        };
        xhr.send();
    }

    function getAllPages(callback, fallback) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "index.json", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback(JSON.parse(xhr.responseText));
            } else if (xhr.readyState === 4 && xhr.status !== 200) {
                fallback();
            }
        };
        xhr.send();
    }

    function getPageList(page, index, callback, fallback) {
        if (!page) fallback();
        if (index < 0 || index >= page.files.length) fallback();
        var xhr = new XMLHttpRequest();
        xhr.open("GET", page.files[index], true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback(JSON.parse(xhr.responseText));
            } else if (xhr.readyState === 4 && xhr.status !== 200) {
                fallback();
            }
        };
        xhr.send();
    }

    function getRestrictStringValue(dict, lcn) {
        if (!dict) return "";
        var keys = Object.keys(dict);
        var tllcn = stringTrim(stringToLower(lcn));
        for (var i = 0; i < keys.length; i++) {
            var tlkey = stringTrim(stringToLower(keys[i]));
            if (tlkey === tllcn) {
                return dict[keys[i]];
            }
        }
        for (var i = 0; i < keys.length; i++) {
            var kr = tlkey.split('-')[0] || kr;
            var lcnr = tllcn.split('-')[0] || lcnr;
            if (kr === tlkey && lcnr === tllcn) {
                return dict[keys[i]];
            }
        }
        return null;
    }

    function getStringValue(dict) {
        var keys = Object.keys(dict);
        var ret = getRestrictStringValue(dict, getBrowserLocale());
        if (ret) return ret;
        ret = getRestrictStringValue(dict, "en-US");
        if (ret) return ret;
        ret = dict["root"];
        if (ret) return ret;
        ret = dict[keys[0]];
        if (ret) return ret;
        return "";
    }

    function stringTrim(str) {
        if (typeof str !== 'string') {
            str = String(str);
        }
        return str.replace(/^\s+|\s+$/g, '');
    }

    function stringToLower(str) {
        if (typeof str !== 'string') {
            str = String(str);
        }
        return str.toLowerCase();
    }

    function getItemDisplayName(item) {
        if (!item) return "";
        return getStringValue(item.properties.displayName);
    }

    function getItemPublisher(item) {
        if (!item) return "";
        return getStringValue(item.properties.publisherDisplayName);
    }

    function getItemDescription(item) {
        if (!item) return "";
        return getStringValue(item.properties.description);
    }

    function getItemLogo(item) {
        return item.directory + "/" + item.items[item.items.length - 1].directory + "/" + item.properties.logo;
    }

    function getNewestVersionItem(item) {
        // 使用传统函数替换箭头函数
        var sorted = item.items.slice().sort(function(a, b) {
            var aVersion = a.version.split('.');
            var bVersion = b.version.split('.');
            for (var i = 0; i < aVersion.length; i++) {
                if (parseInt(aVersion[i]) > parseInt(bVersion[i])) {
                    return -1;
                }
                if (parseInt(aVersion[i]) < parseInt(bVersion[i])) {
                    return 1;
                }
            }
            return 0;
        });
        return sorted[0];
    }

    function compareVersion(left, right) {
        var leftParts = left.split('.');
        var rightParts = right.split('.');
        for (var i = 0; i < leftParts.length; i++) {
            if (parseInt(leftParts[i]) > parseInt(rightParts[i])) {
                return 1;
            }
            if (parseInt(leftParts[i]) < parseInt(rightParts[i])) {
                return -1;
            }
        }
        return 0;
    }

    function arrayContains(arr, item) {
        if (!arr) return false;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) {
                return true;
            }
        }
        return false;
    }

    function getSupportedNewestVersionItem(item) {
        var osInfo = getOSInfo();
        var archi = getCurrentArchitecture();
        if (osInfo.os != "Windows" || archi == "Unknown" || !archi) return getNewestVersionItem(item);
        var supportedItems = [];
        for (var i = 0; i < item.items.length; i++) {
            var itemOsMin = item.items[i].supportOs.osMinVersion;
            if (compareVersion(itemOsMin, osInfo.version) > 0) continue;
            var itemArchi = item.items[i].supportOs.processorArchitecture;
            if (!arrayContains(itemArchi, archi) && !arrayContains(itemArchi, "Neutral")) continue;
            supportedItems.push(item.items[i]);
        }
        if (supportedItems.length > 0) {
            // 使用传统函数替换箭头函数
            supportedItems.sort(function(a, b) {
                return compareVersion(a.version, b.version);
            });
            return supportedItems[0];
        }
        return null;
    }

    function getOSInfo() {
        var ua = navigator.userAgent;
        var os = 'Unknown';
        var version = 'Unknown';
        var winMatch = ua.match(/Windows NT (\d+\.\d+)/);
        if (winMatch) {
            os = 'Windows';
            var ver = winMatch[1];
            return {
                os: os,
                version: ver
            };
        }
        var macMatch = ua.match(/Mac OS X (\d+)[_\.](\d+)(?:[_\.](\d+))?/);
        if (macMatch) {
            os = 'Mac OS X';
            var major = macMatch[1];
            var minor = macMatch[2];
            var patch = macMatch[3] || '0';
            version = major + '.' + minor + '.' + patch;
            return {
                os: os,
                version: version
            };
        }
        if (ua.indexOf('Linux') !== -1) {
            var androidMatch = ua.match(/Android (\d+\.\d+)/);
            if (androidMatch) {
                os = 'Android';
                version = androidMatch[1];
            } else {
                os = 'Linux';
                version = 'Generic';
            }
            return {
                os: os,
                version: version
            };
        }
        return {
            os: os,
            version: version
        };
    }

    function getCurrentArchitecture() {
        var ua = window.navigator.userAgent || '';
        var platform = window.navigator.platform || '';
        var cpuClass = window.navigator.cpuClass;
        var uaLower = ua.toLowerCase();
        var platformLower = platform.toLowerCase();
        if (uaLower.indexOf('arm64') !== -1 ||
            uaLower.indexOf('aarch64') !== -1 ||
            uaLower.indexOf('apple silicon') !== -1) {
            return 'ARM64';
        }
        if (uaLower.indexOf('ia64') !== -1) {
            return 'IA64';
        }
        if (uaLower.indexOf('win64') !== -1 ||
            uaLower.indexOf('x64') !== -1 ||
            uaLower.indexOf('wow64') !== -1) {
            return 'X64';
        }
        if (platformLower.indexOf('x86_64') !== -1 ||
            platformLower.indexOf('amd64') !== -1 ||
            platformLower.indexOf('win64') !== -1) {
            return 'X64';
        }
        if (platform === 'MacIntel') {
            return 'X64';
        }
        if (uaLower.indexOf('arm') !== -1 ||
            platformLower.indexOf('arm') !== -1) {
            return 'ARM';
        }
        if (typeof cpuClass !== 'undefined') {
            var cc = String(cpuClass).toLowerCase();
            if (cc === 'x86') {
                return 'X86';
            } else if (cc === 'x64') {
                return 'X64';
            } else if (cc === 'arm') {
                return 'ARM';
            } else if (cc === 'ia64') {
                return 'IA64';
            }
        }
        return 'Unknown';
    }

    function getBrowserLocale() {
        var lang = navigator.language ||
            navigator.userLanguage ||
            navigator.browserLanguage ||
            'en-US';
        return lang;
    }

    global.store = {
        getAllItems: fetchAllItems,
        getItemDisplayName: getItemDisplayName,
        getItemPublisher: getItemPublisher,
        getItemDescription: getItemDescription,
        getItemLogo: getItemLogo,
        getNewestVersionItem: getNewestVersionItem,
        getSupportedNewestVersionItem: getSupportedNewestVersionItem,
        getAllPages: getAllPages,
        getPageList: getPageList,
        getItem: fetchItem,
    };
})(this);