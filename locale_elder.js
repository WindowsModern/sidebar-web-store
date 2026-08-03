(function(global) {
    var resMap = {
        STORE_NAME: {
            root: "Sidebar Gadget Web Store",
            "en-US": "Sidebar Gadget Web Store",
            "zh-CN": "小工具商店",
        },
        STORE_DESC: {
            root: "Description",
            "en-US": "Description",
            "zh-CN": "描述",
        },
        STORE_DOWNLOAD: {
            root: "Download",
            "en-US": "Download",
            "zh-CN": "下载",
        },
        STORE_HASH: {
            root: "Hash (SHA-256): ",
            "en-US": "Hash (SHA-256): ",
            "zh-CN": "哈希值（SHA-256）：",
        },
        STORE_DOWNLOADNEWEST: {
            root: "Download Newest Version",
            "en-US": "Download Newest Version",
            "zh-CN": "下载最新版本",
        },
        STORE_DOWNLOADSN: {
            root: "Download the latest version compatible with the current system",
            "en-US": "Download the latest version compatible with the current system",
            "zh-CN": "下载支持当前系统的最新版本",
        },
        STORE_VERSIONLIST: {
            root: "Version List",
            "en-US": "Version List",
            "zh-CN": "版本列表",
        },
        STORE_VERITEM_VERSION: {
            root: "Version",
            "en-US": "Version",
            "zh-CN": "版本",
        },
        STORE_VERITEM_RELDATE: {
            root: "Release Date",
            "en-US": "Release Date",
            "zh-CN": "发布日期",
        },
        STORE_VERITEM_SIZE: {
            root: "Size",
            "en-US": "Size",
            "zh-CN": "大小",
        },
        STORE_VERITEM_OS: {
            root: "OS Min Version",
            "en-US": "OS Min Version",
            "zh-CN": "支持的最小操作系统",
        },
        STORE_VERITEM_CPU: {
            root: "Supported CPU Architecture",
            "en-US": "Supported CPU Architecture",
            "zh-CN": "支持的处理器架构"
        },
        STORE_VERITEM_HASH: {
            root: "Hash (SHA-256)",
            "en-US": "Hash (SHA-256)",
            "zh-CN": "哈希值（SHA-256）",
        },
        STORE_VERITEM_DOWNLOAD: {
            root: "Download",
            "en-US": "Download",
            "zh-CN": "下载",
        },
        STORE_GADGETPAGETITLE: {
            root: "{0} - Sidebar Gadget Web Store",
            "en-US": "{0} - Sidebar Gadget Web Store",
            "zh-CN": "{0} - 小工具商店",
        },
        STORE_HOMEPAGE: {
            root: "Home Page",
            "en-US": "Home Page",
            "zh-CN": "主页",
        },
        STORE_NOITEMS: {
            root: "No items found",
            "en-US": "No items found",
            "zh-CN": "没有找到任何内容",
        },
        STORE_GETFAILED: {
            root: "Loading failed, please try again later.",
            "en-US": "Loading failed, please try again later.",
            "zh-CN": "加载数据失败，请稍候重试。",
        },
    };

    function getBrowserLocale() {
        // IE8 不支持 navigator.language，使用 userLanguage 或 browserLanguage
        var lang = navigator.userLanguage ||
            navigator.browserLanguage ||
            navigator.language ||
            'en-US';
        return lang;
    }

    function getRestrictStringValue(dict, lcn) {
        if (!dict) return "";
        var tllcn = stringTrim(stringToLower(lcn));
        // 使用 for-in 遍历对象属性（IE8 兼容）
        for (var key in dict) {
            if (dict.hasOwnProperty(key)) {
                var tlkey = stringTrim(stringToLower(key));
                if (tlkey === tllcn) {
                    return dict[key];
                }
            }
        }
        // 降级匹配主语言（如 zh 匹配 zh-CN）
        var lcnr = tllcn.split('-')[0] || tllcn;
        for (var key in dict) {
            if (dict.hasOwnProperty(key)) {
                var tlkey = stringTrim(stringToLower(key));
                var kr = tlkey.split('-')[0] || tlkey;
                if (kr === lcnr) {
                    return dict[key];
                }
            }
        }
        return null;
    }

    function getStringValue(dict) {
        var ret = getRestrictStringValue(dict, getBrowserLocale());
        if (ret) return ret;
        ret = getRestrictStringValue(dict, "en-US");
        if (ret) return ret;
        ret = dict["root"];
        if (ret) return ret;
        // 返回第一个属性值
        for (var key in dict) {
            if (dict.hasOwnProperty(key)) {
                return dict[key];
            }
        }
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

    function getStringResource(resname) {
        return getStringValue(resMap[resname]);
    }

    // 修正 stringFormat：支持 {0} {1} ... 替换
    function stringFormat(format) {
        var args = arguments;
        var result = format;
        for (var i = 1; i < args.length; i++) {
            var reg = new RegExp('\\{' + (i - 1) + '\\}', 'g');
            result = result.replace(reg, args[i]);
        }
        return result;
    }

    // 将版本字符串转为数字数组（兼容 IE8，不用 map）
    function versionToArray(ver) {
        var parts = ver.split('.');
        var nums = [];
        for (var i = 0; i < parts.length; i++) {
            nums.push(parseInt(parts[i], 10) || 0);
        }
        return nums;
    }

    function getFriendlySystemName(osName, version) {
        var name = osName.toLowerCase();
        var parts = versionToArray(version);
        var major = parts[0] || 0;
        var minor = parts[1] || 0;
        var build = parts[2] || 0;
        var revision = parts[3] || 0;
        if (name === 'windows' || name === 'win') {
            if (major === 10 && build >= 22000) {
                return 'Windows 11';
            }
            if (major === 10 && build >= 10240) {
                return 'Windows 10';
            }
            if (major === 6 && minor === 3) {
                return 'Windows 8.1';
            }
            if (major === 6 && minor === 2) {
                return 'Windows 8';
            }
            if (major === 6 && minor === 1) {
                return 'Windows 7';
            }
            if (major === 6 && minor === 0) {
                return 'Windows Vista';
            }
            if (major === 5) {
                if (minor === 2) {
                    return 'Windows XP Professional x64';
                }
                if (minor === 1) {
                    if (build === 2600) {
                        if (revision >= 5512) return 'Windows XP Service Pack 3';
                        if (revision >= 2180) return 'Windows XP Service Pack 2';
                        if (revision >= 1106) return 'Windows XP Service Pack 1';
                        return 'Windows XP';
                    }
                    return 'Windows XP';
                }
                if (minor === 0) {
                    return 'Windows 2000';
                }
            }
            if (major === 4 && minor === 0) {
                return 'Windows NT 4.0';
            }
            return 'Windows ' + version;
        }
        if (name === 'macos' || name === 'mac' || name === 'darwin') {
            var macMap = {
                '10.15': 'macOS Catalina',
                '10.14': 'macOS Mojave',
                '10.13': 'macOS High Sierra',
                '10.12': 'macOS Sierra',
                '10.11': 'OS X El Capitan',
                '10.10': 'OS X Yosemite'
            };
            var shortVer = major + '.' + minor;
            if (macMap[shortVer]) {
                return macMap[shortVer];
            }
            if (major >= 11) {
                return 'macOS ' + version;
            }
            return 'macOS ' + version;
        }
        if (name === 'linux' || name === 'ubuntu' || name === 'centos' || name === 'debian') {
            if (name === 'ubuntu') return 'Ubuntu ' + version;
            if (name === 'centos') return 'CentOS ' + version;
            if (name === 'debian') return 'Debian ' + version;
            return 'Linux ' + version;
        }
        return osName + ' ' + version;
    }

    // IE8 的 toLocaleDateString 不支持 options 参数，简单返回本地日期字符串
    function formatLocalDate(utcString, locale) {
        var date = new Date(utcString);
        if (isNaN(date.getTime())) {
            return utcString; // 返回原字符串
        }
        // IE8 只支持基本 toLocaleDateString，忽略 locale
        return date.toLocaleDateString();
    }

    function processAllResources() {
        // IE8 支持 querySelectorAll（需标准模式），属性选择器可用
        var elements = document.querySelectorAll('[data-locale-res]');
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            var resName = el.getAttribute('data-locale-res');
            if (resName) {
                var localizedText = getStringResource(resName);
                // IE8 支持 innerText（但可能用 textContent 更好，但 IE8 支持 innerText）
                el.innerText = localizedText;
            }
        }
    }

    global.locale = {
        getStringResource: getStringResource,
        format: stringFormat,
        getFriendlySystemName: getFriendlySystemName,
        formatLocalDate: formatLocalDate,
        processAllResources: processAllResources,
    };

})(this);