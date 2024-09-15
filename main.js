var log = console.log;

var list_at_beginning = [];

function setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value').set;
    if (valueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
    } else {
        valueSetter.call(element, value);
    }
}

function set_text_field(val) {
    var text_field = document.getElementsByClassName("ant-input")[0];
    setNativeValue(text_field, val);
    
    // Trigger the 'input' and 'change' events.
    text_field.dispatchEvent(new Event('input', { bubbles: true }));
    text_field.dispatchEvent(new Event('change', { bubbles: true }));
}

function delay(delayInms, debug = true) {
    const uniqueId = `delay-timer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;  // Einzigartige ID für den Timer

    if (debug) {
        console.log(`Delaying for ${delayInms} ms`);
    }

    if (delayInms > 1000) {
        const timerElement = document.createElement('div');
        timerElement.id = uniqueId;
        timerElement.style.position = 'fixed';
        timerElement.style.top = `${document.querySelectorAll('div[id^="delay-timer"]').length * 40}px`;  // Dynamisch für jeden Timer platzieren
        timerElement.style.left = '0';
        timerElement.style.backgroundColor = 'lightblue';
        timerElement.style.padding = '10px';
        timerElement.style.fontSize = '16px';
        document.body.prepend(timerElement);

        let remainingTime = Math.floor(delayInms / 1000);

        const interval = setInterval(() => {
            timerElement.textContent = `Waiting: ${remainingTime} seconds remaining...`;
            remainingTime--;

            if (remainingTime < 0) {
                clearInterval(interval);
            }
        }, 1000);

        return new Promise(resolve => {
            setTimeout(() => {
                clearInterval(interval);
                document.body.removeChild(timerElement);
                resolve();
            }, delayInms);
        });
    }

    return new Promise(resolve => setTimeout(resolve, delayInms));
}

async function await_build () {
    var build_video = document.getElementsByClassName("build_video")[0];
    log("Checking if build_video is enabled...");
    while ((" " + build_video.className + " ").replace(/[\n\t]/g, " ").indexOf(" disable_build ") > -1) {
        log("Build button is disabled, waiting 10 second...");
        await delay(10000, false);
    }
    log("Build button is enabled, continuing...");
}

async function start_video_generating(text) {
    await waiting_for_spinners();
    
    set_text_field(text);
    
    var build_video = document.getElementsByClassName("build_video")[0];
    log("Starting video generation process...");
    
    while (await await_build()) {
        // This loop waits until the build_video button is enabled
        log("Awaiting the build_video button...");
    }
    
    log("Clicking on build_video button...");
    build_video.click();
    
    await delay(20000);
    
    await waiting_for_spinners();
}

function isVisible(el) {
    if (!el) {
        return false;
    }
    return !(el.offsetParent === null)
}

async function generate_video (text) {
    log(`Generating video for: ${text}`);
    
    await waiting_for_spinners();
        
    await start_video_generating(text);
    
    //await delay(1000 * Math.floor(Math.random() * 20));
}

async function waiting_for_spinners () {
    var _is_visible = isVisible(document.getElementsByClassName("ant-progress-circle-path")[0]);
    
    var _is_visible_misses = 0;
    
    while (_is_visible_misses > 3) {
        log("Waiting until no spinners are visible...");
        await delay(10000, false);
        _is_visible = isVisible(document.getElementsByClassName("ant-progress-circle-path")[0]);
    
        if(!_is_visible) {
            _is_visible_misses++;
            log(`_is_visible_misses: ${_is_visible_misses}`);
        }
    }
    
    //await delay(1000 * Math.floor(Math.random() * 20));
}

async function generate_from_prompts(prompts) {
    log("Starting to generate videos from prompts...");
    
    await waiting_for_spinners();
    
    list_at_beginning = get_current_download_list();
    for (var i = 0; i < prompts.length; i++) {
        var elem = prompts[i];
        log(`Processing prompt ${i + 1}/${prompts.length}: ${elem}`);
        
        await waiting_for_spinners();
        
        await generate_video(elem);
        
        await waiting_for_spinners();
        
        if ((i + 1) != prompts.length) {
            await delay(5*60*1000);
        }
        
        //await download_all_new();
    
        list_at_beginning = get_current_download_list();
    }

    log("Finished generating videos for all prompts.");
    
    await download_all_new();
}

function get_current_download_list () {
    var download_buttons = document.getElementsByClassName("w-4 h-4");
    
    var list = [];
    
    for (var i = 0; i < download_buttons.length; i++) {
        var _dl_button = download_buttons[i];

        if(_dl_button.href) {
            list.push(_dl_button.href)
        }
    }
    
    return list;
}

async function download_all_new () {
    var download_buttons = document.getElementsByClassName("w-4 h-4");
    
    for (var i = 0; i < download_buttons.length; i++) {
        var _dl_button = download_buttons[i];

        if(_dl_button.href && !list_at_beginning.includes(_dl_button.href)) {
            _dl_button.click();
            
            list_at_beginning.push(_dl_button.href);
            
            await delay(10000);
        }
    }
    
    list_at_beginning = get_current_download_list();
}


var prompts = [
    "ein ufo das so groß war das man es kaum glauben kann",
    "nichts was irgendwie sinn ergibt",
    "ein typ der eine pizza degreased"
];

await generate_from_prompts(prompts);
