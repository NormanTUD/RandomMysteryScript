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

function delay(delayInms, reason = "waiting", debug = true) {
    const uniqueId = `delay-timer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;  // Unique ID for the timer

    if (debug) {
        console.log(`Delaying for ${delayInms} ms (${reason})`);
    }

    const timerElement = document.createElement('div');
    timerElement.id = uniqueId;
    timerElement.style.position = 'fixed';
    timerElement.style.top = `${document.querySelectorAll('div[id^="delay-timer"]').length * 40}px`;  // Dynamically place each timer
    timerElement.style.left = '0';
    timerElement.style.backgroundColor = 'lightblue';
    timerElement.style.padding = '10px';
    timerElement.style.fontSize = '16px';
    document.body.prepend(timerElement);

    let remainingTime = Math.floor(delayInms / 1000);

    const interval = setInterval(() => {
        timerElement.textContent = `${reason}: ${remainingTime} seconds remaining...`;
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

    return new Promise(resolve => setTimeout(resolve, delayInms));
}

async function start_video_generating(text) {
    set_text_field(text);
    
    var build_video = document.getElementsByClassName("build_video")[0];
    log("Starting video generation process...");
    
    await wait_for_progress_text();
    
    log("Clicking on build_video button...");
    build_video.click();
    
    await delay(20000, "Waiting for video generation to start");
}

function isVisible(el) {
    if (!el) {
        return false;
    }
    return !(el.offsetParent === null);
}

async function generate_video (text) {
    log(`Generating video for: ${text}`);
    
    await start_video_generating(text);
}

async function waiting_for_spinners () {
    var _is_visible = isVisible(document.getElementsByClassName("ant-progress-circle-path")[0]);
    
    var _is_visible_misses = 0;
    
    while (_is_visible_misses <= 3) {
        log("Waiting until no spinners are visible...");
        await delay(10000, "Waiting for spinners to disappear", false);
        _is_visible = isVisible(document.getElementsByClassName("ant-progress-circle-path")[0]);
    
        if (!_is_visible) {
            _is_visible_misses++;
            log(`_is_visible_misses: ${_is_visible_misses}`);
        }
    }
}

async function wait_for_progress_text() {
    while(document.getElementsByClassName("rotate-image").length) {
        await delay(10000, "Waiting for rotate-images to disappear");
    }
    
    while (document.getElementsByClassName("ant-progress-text").length) {
        await delay(10000, "Waiting for progress text to disappear");
    }
}

async function generate_from_prompts(prompts) {
    log("Starting to generate videos from prompts...");
    
    list_at_beginning = get_current_download_list();
    for (var i = 0; i < prompts.length; i++) {
        var elem = prompts[i];
        log(`Processing prompt ${i + 1}/${prompts.length}: ${elem}`);
        
        await generate_video(elem);
        
        if ((i + 1) != prompts.length) {
            await delay(30000, "Waiting after job started");
            await wait_for_progress_text();
        }
        
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

        if (_dl_button.href) {
            list.push(_dl_button.href);
        }
    }
    
    return list;
}

async function download_all_new () {
    var download_buttons = document.getElementsByClassName("w-4 h-4");
    
    for (var i = 0; i < download_buttons.length; i++) {
        var _dl_button = download_buttons[i];

        if (_dl_button.href && !list_at_beginning.includes(_dl_button.href)) {
            _dl_button.click();
            
            list_at_beginning.push(_dl_button.href);
            
            await delay(10000, "Downloading new video");
        }
    }
    
    list_at_beginning = get_current_download_list();
}


var prompts = [
  "Ein Wettkampf zwischen Büroklammern und Gummibändern, wer den besseren Salto schafft.",
  "Ein Superheld, dessen einzige Kraft es ist, besonders gut im Kaffeekochen zu sein.",
  "Eine Dokumentation über das geheime Leben von Einkaufswagen nach Feierabend.",
  "Wie wäre es mit einem Interview mit einer Banane, die sich selbst als Motivationscoach sieht?",
  "Ein Tag im Leben eines Klebezettels, der Angst hat, dass er bald ersetzt wird.",
  "Ein Fitnessprogramm für Schnecken – die ultimative Slow-Motion-Challenge.",
  "Ein Detektiv, der versucht, das Rätsel eines verschwundenen Sockenpaars zu lösen.",
  "Der epische Kampf zwischen einem Staubwedel und einem Staubsauger um die Weltherrschaft.",
  "Ein Koch, der versucht, eine ganze Mahlzeit nur mit einem Haartrockner zuzubereiten.",
  "Ein Werbespot für einen imaginären Staubsauger, der auch Spaghetti aufrollen kann.",
  "Eine Reality-Show über Hamster, die versuchen, das nächste große Musik-Idol zu werden.",
  "Ein Horrorfilm, in dem ein Kühlschrank seine Bewohner mit abgelaufenen Lebensmitteln terrorisiert.",
  "Ein Wettbewerb, bei dem Leute versuchen, mit Marshmallows Architektur zu bauen.",
  "Ein Interview mit einem Buch, das seine Erlebnisse im Bücherregal schildert.",
  "Ein Tanzwettbewerb zwischen Statuen, die zum Leben erwachen, wenn niemand hinsieht.",
  "Eine Schulung zum Thema: 'Wie man als Pizzakarton im Alltag überlebt.'",
  "Ein Videotagebuch eines Regenschirms, der es satt hat, immer nur bei schlechtem Wetter benutzt zu werden.",
  "Ein Wettessen, bei dem die Teilnehmer versuchen, so viele Pommes wie möglich mit Stäbchen zu essen.",
  "Eine Liebesgeschichte zwischen zwei Wandfarben im Baumarkt, die nie zusammenkommen können.",
  "Ein Supermarkt-Drama, bei dem sich die Produkte in den Regalen nachts zu Teams zusammenschließen und Wettbewerbe austragen."
];


await generate_from_prompts(prompts);
