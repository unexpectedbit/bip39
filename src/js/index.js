(function() {

    // mnemonics is populated as required by getLanguage
    var mnemonics = { "english": new Mnemonic("english") };
    var mnemonic = mnemonics["english"];

    var shamir39 = new Shamir39();


    // QR-scanner initialize
    var html5QrcodeScanner = new Html5QrcodeScanner(
     	 "reader", { fps: 10, qrbox: 250, aspectRatio: 1.777778 });
    html5QrcodeScanner.render(onScanSuccess);
    var lastResult = 0;
    var countResults = 0;
    var current = 0;
    var scanQr = false;

    var seed = null;
    var bip32RootKey = null;
    var bip32ExtendedKey = null;
    var network = libs.bitcoin.networks.bitcoin;
    var addressRowTemplate = $("#address-row-template");

    var showIndex = true;
    var showAddress = true;
    var showPubKey = true;
    var showPrivKey = true;
    var showQr = false;
    var litecoinUseLtub = true;

    var entropyTypeAutoDetect = true;
    var entropyChangeTimeoutEvent = null;
    var phraseChangeTimeoutEvent = null;
    var seedChangedTimeoutEvent = null;
    var rootKeyChangedTimeoutEvent = null;
    var generateRSATimeoutEvent = null;

    var generationProcesses = [];

    var DOM = {};
    DOM.privacyScreenToggle = $(".privacy-screen-toggle");
    DOM.network = $(".network");
    DOM.bip32Client = $("#bip32-client");
    DOM.phraseNetwork = $("#network-phrase");
    DOM.useEntropy = $(".use-entropy");
    DOM.entropyContainer = $(".entropy-container");
    DOM.entropy = $(".entropy");
    DOM.entropyFiltered = DOM.entropyContainer.find(".filtered");
    DOM.entropyType = DOM.entropyContainer.find(".type");
    DOM.entropyTypeInputs = DOM.entropyContainer.find("input[name='entropy-type']");
    DOM.entropyCrackTime = DOM.entropyContainer.find(".crack-time");
    DOM.entropyEventCount = DOM.entropyContainer.find(".event-count");
    DOM.entropyBits = DOM.entropyContainer.find(".bits");
    DOM.entropyBitsPerEvent = DOM.entropyContainer.find(".bits-per-event");
    DOM.entropyWordCount = DOM.entropyContainer.find(".word-count");
    DOM.entropyBinary = DOM.entropyContainer.find(".binary");
    DOM.entropyWordIndexes = DOM.entropyContainer.find(".word-indexes");
    DOM.entropyChecksum = DOM.entropyContainer.find(".checksum");
    DOM.entropyMnemonicLength = DOM.entropyContainer.find(".mnemonic-length");
    DOM.entropyWeakEntropyOverrideWarning = DOM.entropyContainer.find(".weak-entropy-override-warning");
    DOM.entropyFilterWarning = DOM.entropyContainer.find(".filter-warning");
    DOM.phrase = $(".phrase");
    DOM.splitMnemonic = $(".splitMnemonic");
    DOM.showSplitMnemonic = $(".showSplitMnemonic");
    DOM.phraseSplit = $(".phraseSplit");
    DOM.phraseSplitWarn = $(".phraseSplitWarn");
    DOM.passphrase = $(".passphrase");
    DOM.generateContainer = $(".generate-container");
    DOM.generate = $(".generate");
    DOM.seed = $(".seed");
    DOM.rootKey = $(".root-key");
    DOM.litecoinLtubContainer = $(".litecoin-ltub-container");
    DOM.litecoinUseLtub = $(".litecoin-use-ltub");
    DOM.extendedPrivKey = $(".extended-priv-key");
    DOM.extendedPubKey = $(".extended-pub-key");
    DOM.bip32tab = $("#bip32-tab");
    DOM.bip44tab = $("#bip44-tab");
    DOM.bip49tab = $("#bip49-tab");
    DOM.bip84tab = $("#bip84-tab");
    DOM.bip141tab = $("#bip141-tab");
    DOM.bip32panel = $("#bip32");
    DOM.bip44panel = $("#bip44");
    DOM.bip49panel = $("#bip49");
    DOM.bip32path = $("#bip32-path");
    DOM.bip44path = $("#bip44-path");
    DOM.bip44purpose = $("#bip44 .purpose");
    DOM.bip44coin = $("#bip44 .coin");
    DOM.bip44account = $("#bip44 .account");
    DOM.bip44accountXprv = $("#bip44 .account-xprv");
    DOM.bip44accountXpub = $("#bip44 .account-xpub");
    DOM.bip44change = $("#bip44 .change");
    DOM.bip49unavailable = $("#bip49 .unavailable");
    DOM.bip49available = $("#bip49 .available");
    DOM.bip49path = $("#bip49-path");
    DOM.bip49purpose = $("#bip49 .purpose");
    DOM.bip49coin = $("#bip49 .coin");
    DOM.bip49account = $("#bip49 .account");
    DOM.bip49accountXprv = $("#bip49 .account-xprv");
    DOM.bip49accountXpub = $("#bip49 .account-xpub");
    DOM.bip49change = $("#bip49 .change");
    DOM.bip84unavailable = $("#bip84 .unavailable");
    DOM.bip84available = $("#bip84 .available");
    DOM.bip84path = $("#bip84-path");
    DOM.bip84purpose = $("#bip84 .purpose");
    DOM.bip84coin = $("#bip84 .coin");
    DOM.bip84account = $("#bip84 .account");
    DOM.bip84accountXprv = $("#bip84 .account-xprv");
    DOM.bip84accountXpub = $("#bip84 .account-xpub");
    DOM.bip84change = $("#bip84 .change");
    DOM.bip85 = $('.bip85');
    DOM.showBip85 = $('.showBip85');
    DOM.bip85Field = $('.bip85Field');
    DOM.bip85application = $('#bip85-application');
    DOM.bip85mnemonicLanguage = $('#bip85-mnemonic-language');
    DOM.bip85mnemonicLanguageInput = $('.bip85-mnemonic-language-input');
    DOM.bip85mnemonicLength = $('#bip85-mnemonic-length');
    DOM.bip85mnemonicLengthInput = $('.bip85-mnemonic-length-input');
    DOM.bip85index = $('#bip85-index');
    DOM.bip85indexInput = $('.bip85-index-input');
    DOM.bip85bytes = $('#bip85-bytes');
    DOM.bip85bytesInput = $('.bip85-bytes-input');
    DOM.bip141unavailable = $("#bip141 .unavailable");
    DOM.bip141available = $("#bip141 .available");
    DOM.bip141path = $("#bip141-path");
    DOM.bip141semantics = $(".bip141-semantics");
    DOM.generatedStrength = $(".generate-container .strength");
    DOM.generatedStrengthWarning = $(".generate-container .warning");
    DOM.hardenedAddresses = $(".hardened-addresses");
    DOM.bitcoinCashAddressTypeContainer = $(".bch-addr-type-container");
    DOM.bitcoinCashAddressType = $("[name=bch-addr-type]")
    DOM.useBip38 = $(".use-bip38");
    DOM.bip38Password = $(".bip38-password");
    DOM.addresses = $(".addresses");
    DOM.csvTab = $("#csv-tab a");
    DOM.csv = $(".csv");
    DOM.rowsToAdd = $(".rows-to-add");
    DOM.more = $(".more");
    DOM.moreRowsStartIndex = $(".more-rows-start-index");
    DOM.feedback = $(".feedback");
    DOM.tab = $(".derivation-type a");
    DOM.indexToggle = $(".index-toggle");
    DOM.addressToggle = $(".address-toggle");
    DOM.publicKeyToggle = $(".public-key-toggle");
    DOM.privateKeyToggle = $(".private-key-toggle");
    DOM.languages = $(".languages a");
    DOM.qrContainer = $(".qr-container");
    DOM.qrHider = DOM.qrContainer.find(".qr-hider");
    DOM.qrImage = DOM.qrContainer.find(".qr-image");
    DOM.qrHint = DOM.qrContainer.find(".qr-hint");
    DOM.showQrEls = $("[data-show-qr]");

    // Modifications
    DOM.generateTab = $("#generate-tab");
    DOM.reconstructTab = $("#reconstruct-tab");
    DOM.rootKeysContainer = $(".rootkeys-container");
    DOM.showRootKeys = $(".show-rootkeys");
    DOM.bip32RootKey = $(".bip32-root-key");
    DOM.tabContainer = $(".tab-container");
    DOM.showTabs = $(".show-tabs");
    DOM.nextIndex = $(".next-index");
    DOM.splitContainer = $(".splitphrase-container");
    DOM.downloadShamir = $(".download-shamir39");
    DOM.downloadCSV = $(".download-csv");
    DOM.downloadRSA = $(".download-RSA");
    DOM.downloadDRNG = $(".download-DRNG");
    DOM.phraseSuccess = $(".phrase-success");
    DOM.qrScan = $(".qr-scan");
    DOM.qrScanContainer = $(".qr-scan-container");
    DOM.close = $(".close");
    DOM.qrError = $(".qrerror");

    // BIP85 derivation
    DOM.useBip85 = $(".useBip85");
    DOM.bip32RootKeyBip85 = $(".bip32-root-key-bip85");
    DOM.seedBip85 = $(".seed-bip85");
    DOM.passphraseBip85 = $(".passphrase-bip85");
    DOM.passphraseWarningBip85 = $(".passphrase-warning-bip85");
    DOM.rootKeysContainerBip85 = $(".rootkeys-container-bip85");
    DOM.rootKeyBip85 = $(".root-key-bip85");
    DOM.litecoinLtubContainerBip85 = $(".litecoin-ltub-container-bip85");
    DOM.masterSecretKeyBip85 = $(".master-secret-key-bip85");
    DOM.masterPublicKeyBip85 = $(".master-public-key-bip85");
    DOM.tableColor = $(".table");
    DOM.bip85RSAbits = $("#bip85-RSAbits");
    DOM.bip85bitsInput = $(".bip85-bits-input");
    DOM.bip85DRNGBytes = $("#bip85-DRNGbytes");

    // EIP2333
    DOM.eip2333PathContainer = $(".eip2333-path-container")
    DOM.eip2333Keys = $(".eip2333-keys")
    DOM.eip2333KeysBip85 = $(".eip2333-keys-bip85")
    DOM.bipContainers = $(".bip-containers")
    DOM.masterPublicKey = $(".master-public-key");
    DOM.masterSecretKey = $(".master-secret-key");
    DOM.eip2333Path = $("#eip2333-path");
    DOM.eip2333SelectPath = $("#eip2333-select-path");

    // Shamir39
    DOM.parameterM = $(".parameter-m");
    DOM.parameterN = $(".parameter-n");
    DOM.splitParts = $("#split-parts");
    DOM.combineParts = $("#combine-parts");
    DOM.reconstruct = $(".reconstruct");


    function init() {
        // Events
        DOM.privacyScreenToggle.on("change", privacyScreenToggled);
        DOM.generatedStrength.on("change", generatedStrengthChanged);
        DOM.network.on("change", networkChanged);
        DOM.bip32Client.on("change", bip32ClientChanged);
        DOM.useEntropy.on("change", setEntropyVisibility);
        DOM.entropy.on("input", delayedEntropyChanged);
        DOM.entropyMnemonicLength.on("change", entropyChanged);
        DOM.entropyTypeInputs.on("change", entropyTypeChanged);
        DOM.phrase.on("input", delayedPhraseChanged);
        DOM.showSplitMnemonic.on("change", toggleSplitMnemonic);
        DOM.passphrase.on("input", delayedPhraseChanged);
        DOM.generate.on("click", generateClicked);
        DOM.more.on("click", showMore);
        DOM.seed.on("input", delayedSeedChanged);
        DOM.rootKey.on("input", delayedRootKeyChanged);
        DOM.showBip85.on('change', toggleBip85);
        DOM.litecoinUseLtub.on("change", litecoinUseLtubChanged);
        DOM.bip32path.on("input", calcForDerivationPath);
        DOM.bip44account.on("input", calcForDerivationPath);
        DOM.bip44change.on("input", calcForDerivationPath);
        DOM.bip49account.on("input", calcForDerivationPath);
        DOM.bip49change.on("input", calcForDerivationPath);
        DOM.bip84account.on("input", calcForDerivationPath);
        DOM.bip84change.on("input", calcForDerivationPath);
        DOM.bip85application.on('input', calcBip85);
        DOM.bip85mnemonicLanguage.on('change', calcBip85);
        DOM.bip85mnemonicLength.on('change', calcBip85);
        DOM.bip85index.on('input', calcBip85);
        DOM.bip85bytes.on('input', calcBip85);
        DOM.bip141path.on("input", calcForDerivationPath);
        DOM.bip141semantics.on("change", tabChanged);
        DOM.tab.on("shown.bs.tab", tabChanged);
        DOM.hardenedAddresses.on("change", calcForDerivationPath);
        DOM.useBip38.on("change", useBip85);
        DOM.bip38Password.on("change", calcForDerivationPath);
        DOM.indexToggle.on("click", toggleIndexes);
        DOM.addressToggle.on("click", toggleAddresses);
        DOM.publicKeyToggle.on("click", togglePublicKeys);
        DOM.privateKeyToggle.on("click", togglePrivateKeys);
        DOM.csvTab.on("click", updateCsv);
        DOM.languages.on("click", languageChanged);
        DOM.bitcoinCashAddressType.on("change", bitcoinCashAddressTypeChange);

        // Modifications
        DOM.generateTab.on("shown.bs.tab", showPhraseSplitOption);
        DOM.reconstructTab.on("shown.bs.tab", showPhraseSplitOption);
        DOM.showRootKeys.on("change", toggleRootKeys);
        DOM.showTabs.on("change", toggleTabs);
        DOM.nextIndex.on("click", nextIndex);
        DOM.qrScan.on("click", toggleQrScan);
        DOM.qrScanContainer.on("hide.bs.modal", toggleQrScan);
        DOM.downloadCSV.on("click", downloadCSV);
        DOM.downloadRSA.on("click", delayedGenerateRSA);
        DOM.downloadDRNG.on("click", generateDRNGfile);

        // BIP85 derivation
        DOM.useBip85.on("change", useBip85);
        DOM.passphraseBip85.on("input", useBip85);

        // EIP2333
        DOM.masterSecretKey.on("input", masterSecretKeyChanged);
        DOM.eip2333SelectPath.on("input", eip2333SelectPathChanged);
        DOM.eip2333Path.on("input", eip2333SelectPathChanged);

        // Shamir39
        DOM.parameterM.on("input", showSplitPhrase);
        DOM.parameterN.on("input", showSplitPhrase);
        DOM.reconstruct.on("click", reconstruct);
        DOM.downloadShamir.on("click", downloadShamir);

        setQrEvents(DOM.showQrEls);
        disableForms();
        hidePending();
        hideValidationError();
        populateNetworkSelect();
        populateClientSelect();
        setHdCoin(60);

        // EIP2333
        populateEip2333SelectPath()
    }

    // Event handlers

    function generatedStrengthChanged() {
        var strength = parseInt(DOM.generatedStrength.val());
        if (strength < 12) {
            DOM.generatedStrengthWarning.removeClass("hidden");
        }
        else {
            DOM.generatedStrengthWarning.addClass("hidden");
        }
    }

    function networkChanged(e) {
        toggleEth2();
        clearDerivedKeys();
        clearAddressesList();
        DOM.litecoinLtubContainer.addClass("hidden");
        DOM.bitcoinCashAddressTypeContainer.addClass("hidden");
        if (networks[DOM.network.val()].name == "ETH - Ethereum (Consensus Layer)") {
          processMnemonic();
        }
        else {
          var networkIndex = e.target.value;
          var network = networks[networkIndex];
          network.onSelect();
          tabChanged();
        }
    }

    function bip32ClientChanged(e) {
        var clientIndex = DOM.bip32Client.val();
        if (clientIndex == "custom") {
            DOM.bip32path.prop("readonly", false);
        }
        else {
            DOM.bip32path.prop("readonly", true);
            clients[clientIndex].onSelect();
            if (seed != null) {
                phraseChanged();
            }
            else {
                rootKeyChanged();
            }
        }
    }

    function setEntropyVisibility() {
        if (isUsingOwnEntropy()) {
            DOM.entropyContainer.removeClass("hidden");
            DOM.generateContainer.addClass("hidden");
            DOM.phrase.prop("readonly", true);
            DOM.entropy.focus();
            entropyChanged();
        }
        else {
            DOM.entropyContainer.addClass("hidden");
            DOM.generateContainer.removeClass("hidden");
            DOM.phrase.prop("readonly", false);
            hidePending();
        }
    }

    function delayedPhraseChanged() {
        hideValidationError();
        seed = null;
        bip32RootKey = null;
        bip32ExtendedKey = null;
        DOM.combineParts.val("");
        DOM.phraseSuccess.removeClass("bg-success");
        clearAddressesList();
        showPending();
        if (phraseChangeTimeoutEvent != null) {
            clearTimeout(phraseChangeTimeoutEvent);
        }
        phraseChangeTimeoutEvent = setTimeout(function() {
            phraseChanged();
            var entropy = mnemonic.toRawEntropyHex(DOM.phrase.val());
            if (entropy !== null) {
                DOM.entropyMnemonicLength.val("raw");
                DOM.entropy.val(entropy);
                DOM.entropyTypeInputs.filter("[value='hexadecimal']").prop("checked", true);
                entropyTypeAutoDetect = false;
            }
        }, 400);
    }

    function phraseChanged() {
        showPending();
        setMnemonicLanguage();
        DOM.splitParts.val("");

        // Disable BIP85 as source
        DOM.useBip85.prop("checked", false);
        DOM.passphraseWarningBip85.addClass("hidden");
        DOM.tableColor.removeClass("bg-danger");
        DOM.tableColor.addClass("table-striped");
        DOM.rootKeysContainerBip85.addClass("hidden");

        // Get the mnemonic phrase
        var phrase = DOM.phrase.val();
        var errorText = findPhraseErrors(phrase);
        if (errorText) {
            showValidationError(errorText);
            return;
        }
        // Calculate and display
        var passphrase = DOM.passphrase.val();
        calcBip32RootKeyFromSeed(phrase, passphrase);
        if (networks[DOM.network.val()].name == "ETH - Ethereum (Consensus Layer)") {
            displaySource();
            processMnemonic();
        }
        else {
            calcForDerivationPath();
            calcBip85();
        }

        // Show the word indexes
        showWordIndexes();
        writeSplitPhrase(phrase);

        // Shamir39 split
        showSplitPhrase();
    }

    function tabChanged() {
        showPending();
        adjustNetworkForSegwit();
        phrase = source().phrase;
        passphrase = source().passphrase;
        seed = source().seed;
        if (phrase != "") {
            // Calculate and display
            calcBip32RootKeyFromSeed(phrase, passphrase);
        }
        else if (seed != "") {
          bip32RootKey = libs.bitcoin.HDNode.fromSeedHex(source().seed, network);
          var rootKeyBase58 = bip32RootKey.toBase58();
          if (DOM.useBip85.prop("checked")) {
              DOM.rootKeyBip85.val(rootKeyBase58);
          }
          else {
              DOM.rootKey.val(rootKeyBase58);
          }
        }
        else {
            // Calculate and display for root key
            var rootKeyBase58 = DOM.rootKey.val();
            var errorText = validateRootKey(rootKeyBase58);
            if (errorText) {
                showValidationError(errorText);
                return;
            }
            // Calculate and display
            calcBip32RootKeyFromBase58(rootKeyBase58);
        }
        if (networks[DOM.network.val()].name == "ETH - Ethereum (Consensus Layer)") {
            displaySource();
            processMnemonic();
        }
        else {
            calcForDerivationPath();
        }
    }

    function delayedEntropyChanged() {
        hideValidationError();
        showPending();
        if (entropyChangeTimeoutEvent != null) {
            clearTimeout(entropyChangeTimeoutEvent);
        }
        entropyChangeTimeoutEvent = setTimeout(entropyChanged, 400);
    }

    function entropyChanged() {
        // If blank entropy, clear mnemonic, addresses, errors
        if (DOM.entropy.val().trim().length == 0) {
            clearDisplay();
            clearEntropyFeedback();
            DOM.phrase.val("");
            DOM.phraseSplit.val("");
            showValidationError("Blank entropy");
            return;
        }
        // Get the current phrase to detect changes
        var phrase = DOM.phrase.val();
        // Set the phrase from the entropy
        setMnemonicFromEntropy();
        // Recalc addresses if the phrase has changed
        var newPhrase = DOM.phrase.val();
        if (newPhrase != phrase) {
            if (newPhrase.length == 0) {
                clearDisplay();
            }
            else {
                phraseChanged();
            }
        }
        else {
            hidePending();
        }
    }

    function entropyTypeChanged() {
        entropyTypeAutoDetect = false;
        entropyChanged();
    }

    function delayedSeedChanged() {
        // Warn if there is an existing mnemonic or passphrase.
        if (DOM.phrase.val().length > 0 || DOM.passphrase.val().length > 0) {
            if (!confirm("This will clear existing mnemonic, passphrase and BIP32 rootkey. Continue?")) {
                var phrase = DOM.phrase.val();
                var passphrase = DOM.passphrase.val();
                calcBip32RootKeyFromSeed(phrase, passphrase);
                DOM.seed.val(seed);
                return
            }
        }
        hideValidationError();
        showPending();
        // Clear existing mnemonic and passphrase
        DOM.phrase.val("");
        DOM.phraseSplit.val("");
        DOM.splitParts.val("");
        DOM.passphrase.val("");
        DOM.rootKey.val("");
        DOM.bip85Field.val('');
        clearAddressesList();
        clearDerivedKeys();
        seed = null;
        if (seedChangedTimeoutEvent != null) {
            clearTimeout(seedChangedTimeoutEvent);
        }
        seedChangedTimeoutEvent = setTimeout(seedChanged, 400);
    }

    function delayedRootKeyChanged() {
        // Warn if there is an existing mnemonic or passphrase.
        if (DOM.phrase.val().length > 0 || DOM.passphrase.val().length > 0) {
            if (!confirm("This will clear existing mnemonic, passphrase and/or seed")) {
                DOM.rootKey.val(bip32RootKey);
                return
            }
        }
        hideValidationError();
        showPending();
        // Clear existing mnemonic and passphrase
        DOM.phrase.val("");
        DOM.phraseSplit.val("");
        DOM.passphrase.val("");
        seed = null;
        DOM.seed.val("");
        if (rootKeyChangedTimeoutEvent != null) {
            clearTimeout(rootKeyChangedTimeoutEvent);
        }
        rootKeyChangedTimeoutEvent = setTimeout(rootKeyChanged, 400);
    }

    function seedChanged() {
        showPending();
        hideValidationError();

        DOM.useBip85.prop("checked", false);
        DOM.passphraseWarningBip85.addClass("hidden");
        DOM.rootKeysContainerBip85.addClass("hidden");

        seed = DOM.seed.val();
        if (seed.length < 32) {
          showValidationError("Seed should be at least 128 bits");
          return;
        }
        if (networks[DOM.network.val()].name == "ETH - Ethereum (Consensus Layer)") {
            displaySource();
            processMnemonic();
            calcBip85();
            return;
        }

        bip32RootKey = libs.bitcoin.HDNode.fromSeedHex(seed, network);
        var rootKeyBase58 = bip32RootKey.toBase58();
        DOM.rootKey.val(rootKeyBase58);

        var errorText = validateRootKey(rootKeyBase58);
        if (errorText) {
            showValidationError(errorText);
            return;
        }
        // Calculate and display
        calcForDerivationPath();
        calcBip85();

    }

    function rootKeyChanged() {
        showPending();
        hideValidationError();

        DOM.useBip85.prop("checked", false);
        DOM.passphraseWarningBip85.addClass("hidden");
        DOM.rootKeysContainerBip85.addClass("hidden");

        var rootKeyBase58 = DOM.rootKey.val();
        var errorText = validateRootKey(rootKeyBase58);
        if (errorText) {
            showValidationError(errorText);
            return;
        }
        // Calculate and display
        calcBip32RootKeyFromBase58(rootKeyBase58);
        calcForDerivationPath();
        calcBip85();
    }

    function litecoinUseLtubChanged() {
        litecoinUseLtub = DOM.litecoinUseLtub.prop("checked");
        if (litecoinUseLtub) {
            network = libs.bitcoin.networks.litecoin;
        }
        else {
            network = libs.bitcoin.networks.litecoinXprv;
        }
        phraseChanged();
    }

    function toggleSplitMnemonic() {
        if (DOM.showSplitMnemonic.prop("checked")) {
            DOM.splitMnemonic.removeClass("hidden");
        }
        else {
            DOM.splitMnemonic.addClass("hidden");
        }
    }

    function toggleBip85() {
        if (DOM.showBip85.prop("checked")) {
          DOM.bip85.removeClass("hidden");
          DOM.useBip85.prop("checked", false)
          calcBip85();
        }
        else {
          if (DOM.useBip85.prop("checked")) {
          DOM.useBip85.prop("checked", false)
          recalculate();
          }
          DOM.bip85.addClass("hidden");
        }
        toggleEth2();
    }

    function toggleBip85Fields() {
        if (DOM.showBip85.prop('checked')) {
            DOM.bip85mnemonicLanguageInput.addClass('hidden');
            DOM.bip85mnemonicLengthInput.addClass('hidden');
            DOM.bip85bytesInput.addClass('hidden');
            DOM.bip85bitsInput.addClass('hidden');

            var app = DOM.bip85application.val();
            if (app === 'bip39') {
              DOM.bip85mnemonicLanguageInput.removeClass('hidden');
              DOM.bip85mnemonicLengthInput.removeClass('hidden');
            } else if (app === 'hex') {
              DOM.bip85bytesInput.removeClass('hidden');
            } else if (app === 'DRNG/RSA') {
              DOM.bip85bitsInput.removeClass('hidden');
            }
        }
    }

    function nextIndex() {
        var counter = parseIntNoNaN(DOM.bip85index.val());
        if (counter == undefined) {
          DOM.bip85index.val(0);
        }
        else {
        counter += 1;
        DOM.bip85index.val(counter);
        }
        calcBip85();
    }

    function useBip85() {
        var app = DOM.bip85application.val();
        if (app !== 'bip39') {
          DOM.useBip85.prop("checked", false);
          showValidationError("Available only with BIP85 application: BIP39");
          return;
        }
        if (DOM.useBip85.prop("checked")) {
            if (DOM.showRootKeys.prop("checked")) {
              DOM.rootKeysContainerBip85.removeClass("hidden");
            }
            DOM.passphraseWarningBip85.removeClass("hidden");
            DOM.tableColor.addClass("bg-danger");
            DOM.tableColor.removeClass("table-striped");
        }
        else {
            DOM.passphraseWarningBip85.addClass("hidden");
            DOM.tableColor.removeClass("bg-danger");
            DOM.tableColor.addClass("table-striped");
            DOM.rootKeysContainerBip85.addClass("hidden");
            DOM.passphraseBip85.val("");
        }
        toggleEth2();
        tabChanged();
    }

    function source() {
        if (DOM.useBip85.prop("checked")) {
            var phrase = DOM.bip85Field.val();
            var passphrase = DOM.passphraseBip85.val();
            var seed = DOM.seedBip85.val();
            var rootKey = DOM.rootKeyBip85.val();
            var masterSecretKey = hexToBytes(DOM.masterSecretKeyBip85.val());
            var masterPublicKey = hexToBytes(DOM.masterPublicKeyBip85.val());

        }
        else {
            var phrase = DOM.phrase.val();
            var passphrase = DOM.passphrase.val();
            var seed = DOM.seed.val();
            var rootKey = DOM.rootKey.val();
            var masterSecretKey = hexToBytes(DOM.masterSecretKey.val());
            var masterPublicKey = hexToBytes(DOM.masterPublicKey.val());
        }

        return {phrase:phrase, passphrase:passphrase, seed:seed, rootKey:rootKey, masterSecretKey:masterSecretKey, masterPublicKey:masterPublicKey};
    }

    function displaySource() {

        if (DOM.useBip85.prop("checked")) {
            DOM.seedBip85.val(seed);
            var rootKey = bip32RootKey.toBase58();
            DOM.rootKeyBip85.val(rootKey);
        }
        else {
            if(seed !== null) {
              DOM.seed.val(seed);
              if (seed.length >= 64) {
                  DOM.eip2333Keys.removeClass("bg-danger");
              }
            }
            var rootKey = bip32RootKey.toBase58();
            DOM.rootKey.val(rootKey);
        }
    }

    function recalculate() {
        if (DOM.phrase.val().length > 0) {
          delayedPhraseChanged();
        } else if (DOM.seed.val().length > 0) {
          seedChanged()
        }
        else {
        seed = null;
        rootKeyChanged();
        };
    }

    function toggleRootKeys() {
        toggleEth2();
        if (DOM.showRootKeys.prop("checked")) {
            DOM.rootKeysContainer.removeClass("hidden");
            if (DOM.useBip85.prop("checked")) {
              DOM.rootKeysContainerBip85.removeClass("hidden");
            }
        }
        else {
            DOM.rootKeysContainer.addClass("hidden");
            DOM.rootKeysContainerBip85.addClass("hidden");
        }
    }

    function toggleEth2() {
        if (networks[DOM.network.val()].name == "ETH - Ethereum (Consensus Layer)") {
            if (DOM.showRootKeys.prop("checked")) {
                if (DOM.useBip85.prop("checked")) {
                    DOM.bip32RootKeyBip85.addClass("hidden");
                    DOM.eip2333KeysBip85.removeClass("hidden");
                }
                DOM.eip2333Keys.removeClass("hidden");
                DOM.bip32RootKey.addClass("hidden");
            }
            DOM.eip2333PathContainer.removeClass("hidden");
            DOM.bipContainers.addClass("hidden");
        }
        else {
            if (DOM.showRootKeys.prop("checked")) {
                if (DOM.useBip85.prop("checked")) {
                    DOM.bip32RootKeyBip85.removeClass("hidden");
                    DOM.eip2333KeysBip85.addClass("hidden");
                }
                DOM.eip2333Keys.addClass("hidden");
                DOM.bip32RootKey.removeClass("hidden");
            }
            DOM.eip2333PathContainer.addClass("hidden");
            DOM.bipContainers.removeClass("hidden");
        }
    }

    function toggleTabs() {
        if (DOM.showTabs.prop("checked")) {
            DOM.tabContainer.removeClass("hidden");
        }
        else {
            DOM.tabContainer.addClass("hidden");
            DOM.bip44tab.removeClass("active");
            DOM.bip49tab.removeClass("active");
            DOM.bip84tab.removeClass("active");
            DOM.bip141tab.removeClass("active");
            DOM.bip32tab.addClass("active");
            tabChanged();
        }
    }

    function showPhraseSplitOption() {
        //It is backwards, because the Generate tab has class "active" until this function executes
        if (DOM.generateTab.hasClass("active")) {
            DOM.splitContainer.removeClass("hidden");
            DOM.phrase.prop("readonly", false);
        }
        else {
            DOM.splitContainer.addClass("hidden");
            DOM.phrase.prop("readonly", true);
        }
    }

    function calcBip85() {
      toggleBip85Fields();

      var app = DOM.bip85application.val();
      if (app !== 'bip39' && DOM.useBip85.prop('checked')) {
        DOM.useBip85.prop("checked", false);
        recalculate();
      }
      var rootKeyBase58 = DOM.rootKey.val();
      if (!rootKeyBase58) {
        return;
      }

      try {
        // try parsing using base network params
        // The bip85 lib only understands xpubs, so compute it
        var rootKey = libs.bitcoin.HDNode.fromBase58(rootKeyBase58, network);
        rootKey.keyPair.network = libs.bitcoin.networks['bitcoin']
        var master = libs.bip85.BIP85.fromBase58(rootKey.toBase58());

        var result;

        const index = parseInt(DOM.bip85index.val(), 10);

        if (app === 'bip39') {
          const language = parseInt(DOM.bip85mnemonicLanguage.val(), 10);
          const length = parseInt(DOM.bip85mnemonicLength.val(), 10);
          result = master.deriveBIP39(language, length, index).toMnemonic();
        } else if (app === 'wif') {
          result = master.deriveWIF(index).toWIF();
        } else if (app === 'xprv') {
          result = master.deriveXPRV(index).toXPRV();
        } else if (app === 'hex') {
          const bytes = parseInt(DOM.bip85bytes.val(), 10);
          result = master.deriveHex(bytes, index).toEntropy();
        } else if (app === 'DRNG/RSA') {
          var bip85path = "m/83696968'/0'/"+index+"'";
          result = master.derive(bip85path, bytesLength = 64);
        }

        hideValidationError();
        DOM.bip85Field.val(result);
      } catch (e) {
        showValidationError('BIP85: ' + e.message);
        DOM.bip85Field.val('');
      }
      if (DOM.useBip85.prop("checked")) {
        useBip85();
      }
    }

    function preGenerateDRNG() {
      var rootKeyBase58 = DOM.rootKey.val();
      var rootKey = libs.bitcoin.HDNode.fromBase58(rootKeyBase58, network);
      rootKey.keyPair.network = libs.bitcoin.networks['bitcoin']
      var master = libs.bip85.BIP85.fromBase58(rootKey.toBase58());
      return master;
    }

    function generateDRNGfile(){
      try {
          var master = preGenerateDRNG();
          var keyBytes = parseIntNoNaN(DOM.bip85DRNGBytes.val(), 10)*8;
          var bip85DRNGpath = "m/83696968'/0'/0'";
          var entropyDRNG = master.derive(bip85DRNGpath, bytesLength = 64);
          var shaObj = new jsSHA("SHAKE256", "HEX");
          shaObj.update(entropyDRNG);
          var entropyDRNGhex = shaObj.getHash("HEX", {outputLen: keyBytes})
          download(shaObj.getHash("BYTES", {outputLen: keyBytes}), "DRNG", "octet/stream");
      } catch (e) {
        showValidationError('DRNG: ' + e.message);
      }

    }

    function delayedGenerateRSA(){
      hideValidationError();
      showPending();
      if (generateRSATimeoutEvent != null) {
          clearTimeout(generateRSATimeoutEvent);
      }
      generateRSATimeoutEvent = setTimeout(generateRSA, 400);
    }

    function generateRSA(){
      try {
          var master = preGenerateDRNG();
          var index = parseInt(DOM.bip85index.val(), 10);
          var keyBits = parseInt(DOM.bip85RSAbits.val(), 10);
          var bip85RSApath = "m/"+83696968+"'/"+828365+"'/"+keyBits+"'/"+index+"'";
          var entropyDRNG = master.derive(bip85RSApath, bytesLength = 64);
          var shaObj = new jsSHA("SHAKE256", "HEX");
          shaObj.update(entropyDRNG);
          var call = 0;

          // node-forge usually only takes keyBits/8 long string of DRNG bytes
          // to construct two prime numbers, each keyBits/2 bits long. But to be safe, the DRNG
          // generates 64 times more bytes.
          var a = shaObj.getHash("BYTES", {outputLen: (keyBits*64)});

          var drng = {
              drnginput: 0
              };
          drng.getBytesSync = function(count){
              var dcount = (count-1)
              var start = call;
              var end = start + count-1;
              var drngBytes = "\u0000"+a.slice(start, end);
              call = call + dcount;
              console.log("Called: "+end/dcount);
              console.log("Cut: "+end*2);
              return drngBytes;
          };
          var rsaKey = forge.pki.rsa.generateKeyPair({
              bits: keyBits,
              e: 65537,
              prng: drng,
              //algorithm: 'PRIMEINC'
              });

          function extractPrimeNumber(x) {
            var p = ("0x");
            for (var i = x.length-1; i>=0; --i) {
              a = x[i].toString(16);
              if(i==x.length-1) {
                p += a;
              } else {
                p += String(a).padStart(7, '0');
              }
            };
            return p;
          };
          download(forge.pki.privateKeyToPem(rsaKey.privateKey), "privKey.pem", "octet/stream");
          download(forge.pki.publicKeyToPem(rsaKey.publicKey), "pubKey.pem");
        } catch (e) {
          showValidationError('RSA: ' + e.message);
        }
        hidePending();
    }

    function calcForDerivationPath() {
        clearDerivedKeys();
        clearAddressesList();
        showPending();
        // Don't show segwit if it's selected but network doesn't support it
        if (segwitSelected() && !networkHasSegwit()) {
            showSegwitUnavailable();
            hidePending();
            return;
        }
        showSegwitAvailable();
        // Get the derivation path
        var derivationPath = getDerivationPath();
        var errorText = findDerivationPathErrors(derivationPath);
        if (errorText) {
            showValidationError(errorText);
            return;
        }
        bip32ExtendedKey = calcBip32ExtendedKey(derivationPath);
        if (bip44TabSelected()) {
            displayBip44Info();
        }
        else if (bip49TabSelected()) {
            displayBip49Info();
        }
        else if (bip84TabSelected()) {
            displayBip84Info();
        }
        displayBip32Info();
    }

    function generateClicked() {
        if (isUsingOwnEntropy()) {
            return;
        }
        clearDisplay();
        showPending();
        setTimeout(function() {
            setMnemonicLanguage();
            var phrase = generateRandomPhrase();
            if (!phrase) {
                return;
            }
            phraseChanged();
        }, 50);
    }

    function languageChanged() {
        setTimeout(function() {
            setMnemonicLanguage();
            if (DOM.phrase.val().length > 0) {
                var newPhrase = convertPhraseToNewLanguage();
                DOM.phrase.val(newPhrase);
                phraseChanged();
            }
            else {
                DOM.generate.trigger("click");
            }
        }, 50);
    }

    function bitcoinCashAddressTypeChange() {
        phraseChanged();
    }

    function toggleIndexes() {
        showIndex = !showIndex;
        $("td.index span").toggleClass("invisible");
    }

    function toggleAddresses() {
        showAddress = !showAddress;
        $("td.address span").toggleClass("invisible");
    }

    function togglePublicKeys() {
        showPubKey = !showPubKey;
        $("td.pubkey span").toggleClass("invisible");
    }

    function togglePrivateKeys() {
        showPrivKey = !showPrivKey;
        $("td.privkey span").toggleClass("invisible");
    }

    function privacyScreenToggled() {
        // private-data contains elements added to DOM at runtime
        // so catch all by adding visual privacy class to the root of the DOM
        if (DOM.privacyScreenToggle.prop("checked")) {
            $("body").addClass("visual-privacy");
        }
        else {
            $("body").removeClass("visual-privacy");
        }
    }

    // Private methods

    function generateRandomPhrase() {
        if (!hasStrongRandom()) {
            var errorText = "This browser does not support strong randomness";
            showValidationError(errorText);
            return;
        }
        // get the amount of entropy to use
        var numWords = parseInt(DOM.generatedStrength.val());
        var strength = numWords / 3 * 32;
        var buffer = new Uint8Array(strength / 8);
        // create secure entropy
        var data = crypto.getRandomValues(buffer);
        // show the words
        var words = mnemonic.toMnemonic(data);
        DOM.phrase.val(words);
        // show the entropy
        var entropyHex = uint8ArrayToHex(data);
        DOM.entropy.val(entropyHex);
        // ensure entropy fields are consistent with what is being displayed
        DOM.entropyMnemonicLength.val("raw");
        return words;
    }

    function calcBip32RootKeyFromSeed(phrase, passphrase) {
        seed = mnemonic.toSeed(phrase, passphrase);
        bip32RootKey = libs.bitcoin.HDNode.fromSeedHex(seed, network);
        if(isGRS())
            bip32RootKey = libs.groestlcoinjs.HDNode.fromSeedHex(seed, network);

    }

    function calcBip32RootKeyFromBase58(rootKeyBase58) {
        if(isGRS()) {
            calcBip32RootKeyFromBase58GRS(rootKeyBase58);
            return;
        }
        // try parsing with various segwit network params since this extended
        // key may be from any one of them.
        if (networkHasSegwit()) {
            var n = network;
            if ("baseNetwork" in n) {
                n = libs.bitcoin.networks[n.baseNetwork];
            }
            // try parsing using base network params
            try {
                bip32RootKey = libs.bitcoin.HDNode.fromBase58(rootKeyBase58, n);
                return;
            }
            catch (e) {}
            // try parsing using p2wpkh params
            if ("p2wpkh" in n) {
                try {
                    bip32RootKey = libs.bitcoin.HDNode.fromBase58(rootKeyBase58, n.p2wpkh);
                    return;
                }
                catch (e) {}
            }
            // try parsing using p2wpkh-in-p2sh network params
            if ("p2wpkhInP2sh" in n) {
                try {
                    bip32RootKey = libs.bitcoin.HDNode.fromBase58(rootKeyBase58, n.p2wpkhInP2sh);
                    return;
                }
                catch (e) {}
            }
            // try parsing using p2wsh network params
            if ("p2wsh" in n) {
                try {
                    bip32RootKey = libs.bitcoin.HDNode.fromBase58(rootKeyBase58, n.p2wsh);
                    return;
                }
                catch (e) {}
            }
            // try parsing using p2wsh-in-p2sh network params
            if ("p2wshInP2sh" in n) {
                try {
                    bip32RootKey = libs.bitcoin.HDNode.fromBase58(rootKeyBase58, n.p2wshInP2sh);
                    return;
                }
                catch (e) {}
            }
        }
        // try the network params as currently specified
        bip32RootKey = libs.bitcoin.HDNode.fromBase58(rootKeyBase58, network);
    }

    function calcBip32RootKeyFromBase58GRS(rootKeyBase58) {
        // try parsing with various segwit network params since this extended
        // key may be from any one of them.
        if (networkHasSegwit()) {
            var n = network;
            if ("baseNetwork" in n) {
                n = libs.bitcoin.networks[n.baseNetwork];
            }
            // try parsing using base network params
            try {
                bip32RootKey = libs.groestlcoinjs.HDNode.fromBase58(rootKeyBase58, n);
                return;
            }
            catch (e) {}
            // try parsing using p2wpkh params
            if ("p2wpkh" in n) {
                try {
                    bip32RootKey = libs.groestlcoinjs.HDNode.fromBase58(rootKeyBase58, n.p2wpkh);
                    return;
                }
                catch (e) {}
            }
            // try parsing using p2wpkh-in-p2sh network params
            if ("p2wpkhInP2sh" in n) {
                try {
                    bip32RootKey = libs.groestlcoinjs.HDNode.fromBase58(rootKeyBase58, n.p2wpkhInP2sh);
                    return;
                }
                catch (e) {}
            }
        }
        // try the network params as currently specified
        bip32RootKey = libs.groestlcoinjs.HDNode.fromBase58(rootKeyBase58, network);
    }

    function calcBip32ExtendedKey(path) {
        // Check there's a root key to derive from
        if (!bip32RootKey) {
            return bip32RootKey;
        }
        var extendedKey = bip32RootKey;
        // Derive the key from the path
        var pathBits = path.split("/");
        for (var i=0; i<pathBits.length; i++) {
            var bit = pathBits[i];
            var index = parseInt(bit);
            if (isNaN(index)) {
                continue;
            }
            var hardened = bit[bit.length-1] == "'";
            var isPriv = !(extendedKey.isNeutered());
            var invalidDerivationPath = hardened && !isPriv;
            if (invalidDerivationPath) {
                extendedKey = null;
            }
            else if (hardened) {
                extendedKey = extendedKey.deriveHardened(index);
            }
            else {
                extendedKey = extendedKey.derive(index);
            }
        }
        return extendedKey;
    }

    function showValidationError(errorText) {
        DOM.feedback
            .text(errorText)
            .show();
    }

    function hideValidationError() {
        DOM.feedback
            .text("")
            .hide();
    }

    function findPhraseErrors(phrase) {
        // Preprocess the words
        phrase = mnemonic.normalizeString(phrase);
        var words = phraseToWordArray(phrase);
        // Detect blank phrase
        if (words.length == 0) {
            return "Blank mnemonic";
        }
        // Check each word
        for (var i=0; i<words.length; i++) {
            var word = words[i];
            var language = getLanguage();
            if (WORDLISTS[language].indexOf(word) == -1) {
                console.log("Finding closest match to " + word);
                var nearestWord = findNearestWord(word);
                return word + " not in wordlist, did you mean " + nearestWord + "?";
            }
        }
        // Check the words are valid
        var properPhrase = wordArrayToPhrase(words);
        var isValid = mnemonic.check(properPhrase);
        if (!isValid) {
            return "Invalid mnemonic";
        }
        return false;
    }

    function validateRootKey(rootKeyBase58) {
        if(isGRS())
            return validateRootKeyGRS(rootKeyBase58);

        // try various segwit network params since this extended key may be from
        // any one of them.
        if (networkHasSegwit()) {
            var n = network;
            if ("baseNetwork" in n) {
                n = libs.bitcoin.networks[n.baseNetwork];
            }
            // try parsing using base network params
            try {
                libs.bitcoin.HDNode.fromBase58(rootKeyBase58, n);
                return "";
            }
            catch (e) {}
            // try parsing using p2wpkh params
            if ("p2wpkh" in n) {
                try {
                    libs.bitcoin.HDNode.fromBase58(rootKeyBase58, n.p2wpkh);
                    return "";
                }
                catch (e) {}
            }
            // try parsing using p2wpkh-in-p2sh network params
            if ("p2wpkhInP2sh" in n) {
                try {
                    libs.bitcoin.HDNode.fromBase58(rootKeyBase58, n.p2wpkhInP2sh);
                    return "";
                }
                catch (e) {}
            }
            // try parsing using p2wsh network params
            if ("p2wsh" in n) {
                try {
                    libs.bitcoin.HDNode.fromBase58(rootKeyBase58, n.p2wsh);
                    return "";
                }
                catch (e) {}
            }
            // try parsing using p2wsh-in-p2sh network params
            if ("p2wshInP2sh" in n) {
                try {
                    libs.bitcoin.HDNode.fromBase58(rootKeyBase58, n.p2wshInP2sh);
                    return "";
                }
                catch (e) {}
            }
        }
        // try the network params as currently specified
        try {
            libs.bitcoin.HDNode.fromBase58(rootKeyBase58, network);
        }
        catch (e) {
            return "Invalid root key";
        }
        return "";
    }

    function validateRootKeyGRS(rootKeyBase58) {
        // try various segwit network params since this extended key may be from
        // any one of them.
        if (networkHasSegwit()) {
            var n = network;
            if ("baseNetwork" in n) {
                n = libs.bitcoin.networks[n.baseNetwork];
            }
            // try parsing using base network params
            try {
                libs.groestlcoinjs.HDNode.fromBase58(rootKeyBase58, n);
                return "";
            }
            catch (e) {}
            // try parsing using p2wpkh params
            if ("p2wpkh" in n) {
                try {
                    libs.groestlcoinjs.HDNode.fromBase58(rootKeyBase58, n.p2wpkh);
                    return "";
                }
                catch (e) {}
            }
            // try parsing using p2wpkh-in-p2sh network params
            if ("p2wpkhInP2sh" in n) {
                try {
                    libs.groestlcoinjs.HDNode.fromBase58(rootKeyBase58, n.p2wpkhInP2sh);
                    return "";
                }
                catch (e) {}
            }
        }
        // try the network params as currently specified
        try {
            libs.groestlcoinjs.HDNode.fromBase58(rootKeyBase58, network);
        }
        catch (e) {
            return "Invalid root key";
        }
        return "";
    }

    function getDerivationPath() {
        if (bip44TabSelected()) {
            var purpose = parseIntNoNaN(DOM.bip44purpose.val(), 44);
            var coin = parseIntNoNaN(DOM.bip44coin.val(), 0);
            var account = parseIntNoNaN(DOM.bip44account.val(), 0);
            var change = parseIntNoNaN(DOM.bip44change.val(), 0);
            var path = "m/";
            path += purpose + "'/";
            path += coin + "'/";
            path += account + "'/";
            path += change;
            DOM.bip44path.val(path);
            var derivationPath = DOM.bip44path.val();
            console.log("Using derivation path from BIP44 tab: " + derivationPath);
            return derivationPath;
        }
        else if (bip49TabSelected()) {
            var purpose = parseIntNoNaN(DOM.bip49purpose.val(), 49);
            var coin = parseIntNoNaN(DOM.bip49coin.val(), 0);
            var account = parseIntNoNaN(DOM.bip49account.val(), 0);
            var change = parseIntNoNaN(DOM.bip49change.val(), 0);
            var path = "m/";
            path += purpose + "'/";
            path += coin + "'/";
            path += account + "'/";
            path += change;
            DOM.bip49path.val(path);
            var derivationPath = DOM.bip49path.val();
            console.log("Using derivation path from BIP49 tab: " + derivationPath);
            return derivationPath;
        }
        else if (bip84TabSelected()) {
            var purpose = parseIntNoNaN(DOM.bip84purpose.val(), 84);
            var coin = parseIntNoNaN(DOM.bip84coin.val(), 0);
            var account = parseIntNoNaN(DOM.bip84account.val(), 0);
            var change = parseIntNoNaN(DOM.bip84change.val(), 0);
            var path = "m/";
            path += purpose + "'/";
            path += coin + "'/";
            path += account + "'/";
            path += change;
            DOM.bip84path.val(path);
            var derivationPath = DOM.bip84path.val();
            console.log("Using derivation path from BIP84 tab: " + derivationPath);
            return derivationPath;
        }
        else if (bip32TabSelected()) {
            if (DOM.bip32Client.val() == "3") {
                DOM.bip32path.val("m/44'/"+DOM.bip44coin.val()+"'/0'");
            }
            var derivationPath = DOM.bip32path.val();
            console.log("Using derivation path from BIP32 tab: " + derivationPath);
            return derivationPath;
        }
        else if (bip141TabSelected()) {
            var derivationPath = DOM.bip141path.val();
            console.log("Using derivation path from BIP141 tab: " + derivationPath);
            return derivationPath;
        }
        else {
            console.log("Unknown derivation path");
        }
    }

    function findDerivationPathErrors(path) {
        // TODO is not perfect but is better than nothing
        // Inspired by
        // https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#test-vectors
        // and
        // https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#extended-keys
        var maxDepth = 255; // TODO verify this!!
        var maxIndexValue = Math.pow(2, 31); // TODO verify this!!
        if (path[0] != "m") {
            return "First character must be 'm'";
        }
        if (path.length > 1) {
            if (path[1] != "/") {
                return "Separator must be '/'";
            }
            var indexes = path.split("/");
            if (indexes.length > maxDepth) {
                return "Derivation depth is " + indexes.length + ", must be less than " + maxDepth;
            }
            for (var depth = 1; depth<indexes.length; depth++) {
                var index = indexes[depth];
                var invalidChars = index.replace(/^[0-9]+'?$/g, "")
                if (invalidChars.length > 0) {
                    return "Invalid characters " + invalidChars + " found at depth " + depth;
                }
                var indexValue = parseInt(index.replace("'", ""));
                if (isNaN(depth)) {
                    return "Invalid number at depth " + depth;
                }
                if (indexValue > maxIndexValue) {
                    return "Value of " + indexValue + " at depth " + depth + " must be less than " + maxIndexValue;
                }
            }
        }
        // Check root key exists or else derivation path is useless!
        if (!bip32RootKey) {
            return "No root key";
        }
        // Check no hardened derivation path when using xpub keys
        var hardenedPath = path.indexOf("'") > -1;
        var hardenedAddresses = bip32TabSelected() && DOM.hardenedAddresses.prop("checked");
        var hardened = hardenedPath || hardenedAddresses;
        var isXpubkey = bip32RootKey.isNeutered();
        if (hardened && isXpubkey) {
            return "Hardened derivation path is invalid with xpub key";
        }
        return false;
    }

    function isGRS() {
        return networks[DOM.network.val()].name == "GRS - Groestlcoin" || networks[DOM.network.val()].name == "GRS - Groestlcoin Testnet";
    }

    function isELA() {
        return networks[DOM.network.val()].name == "ELA - Elastos"
    }

    function displayBip44Info() {
        // Get the derivation path for the account
        var purpose = parseIntNoNaN(DOM.bip44purpose.val(), 44);
        var coin = parseIntNoNaN(DOM.bip44coin.val(), 0);
        var account = parseIntNoNaN(DOM.bip44account.val(), 0);
        var path = "m/";
        path += purpose + "'/";
        path += coin + "'/";
        path += account + "'/";
        // Calculate the account extended keys
        var accountExtendedKey = calcBip32ExtendedKey(path);
        var accountXprv = accountExtendedKey.toBase58();
        var accountXpub = accountExtendedKey.neutered().toBase58();

        // Display the extended keys
        DOM.bip44accountXprv.val(accountXprv);
        DOM.bip44accountXpub.val(accountXpub);

        if (isELA()) {
            displayBip44InfoForELA();
        }
    }

    function displayBip49Info() {
        // Get the derivation path for the account
        var purpose = parseIntNoNaN(DOM.bip49purpose.val(), 49);
        var coin = parseIntNoNaN(DOM.bip49coin.val(), 0);
        var account = parseIntNoNaN(DOM.bip49account.val(), 0);
        var path = "m/";
        path += purpose + "'/";
        path += coin + "'/";
        path += account + "'/";
        // Calculate the account extended keys
        var accountExtendedKey = calcBip32ExtendedKey(path);
        var accountXprv = accountExtendedKey.toBase58();
        var accountXpub = accountExtendedKey.neutered().toBase58();
        // Display the extended keys
        DOM.bip49accountXprv.val(accountXprv);
        DOM.bip49accountXpub.val(accountXpub);
    }

    function displayBip84Info() {
        // Get the derivation path for the account
        var purpose = parseIntNoNaN(DOM.bip84purpose.val(), 84);
        var coin = parseIntNoNaN(DOM.bip84coin.val(), 0);
        var account = parseIntNoNaN(DOM.bip84account.val(), 0);
        var path = "m/";
        path += purpose + "'/";
        path += coin + "'/";
        path += account + "'/";
        // Calculate the account extended keys
        var accountExtendedKey = calcBip32ExtendedKey(path);
        var accountXprv = accountExtendedKey.toBase58();
        var accountXpub = accountExtendedKey.neutered().toBase58();
        // Display the extended keys
        DOM.bip84accountXprv.val(accountXprv);
        DOM.bip84accountXpub.val(accountXpub);
    }

    function displayBip32Info() {
        // Display the key
        displaySource();
        var xprvkeyB58 = "NA";
        if (!bip32ExtendedKey.isNeutered()) {
            xprvkeyB58 = bip32ExtendedKey.toBase58();
        }
        var extendedPrivKey = xprvkeyB58;
        DOM.extendedPrivKey.val(extendedPrivKey);
        var extendedPubKey = bip32ExtendedKey.neutered().toBase58();
        DOM.extendedPubKey.val(extendedPubKey);
        // Display the addresses and privkeys
        clearAddressesList();
        var initialAddressCount = parseInt(DOM.rowsToAdd.val());
        displayAddresses(0, initialAddressCount);

        if (isELA()) {
            displayBip32InfoForELA();
        }
    }

    function displayAddresses(start, total) {
        generationProcesses.push(new (function() {

            var rows = [];

            this.stop = function() {
                for (var i=0; i<rows.length; i++) {
                    rows[i].shouldGenerate = false;
                }
                hidePending();
            }

            if (networks[DOM.network.val()].name == "ETH - Ethereum (Consensus Layer)") {
              showRows(start, total);
            }

            else {
                for (var i=0; i<total; i++) {
                var index = i + start;
                var isLast = i == total - 1;
                rows.push(new TableRow(index, isLast));
                }
            }
        })());
    }

    function segwitSelected() {
        return bip49TabSelected() || bip84TabSelected() || bip141TabSelected();
    }

    function p2wpkhSelected() {
        return bip84TabSelected() ||
                bip141TabSelected() && DOM.bip141semantics.val() == "p2wpkh";
    }

    function p2wpkhInP2shSelected() {
        return bip49TabSelected() ||
            (bip141TabSelected() && DOM.bip141semantics.val() == "p2wpkh-p2sh");
    }

    function p2wshSelected() {
        return bip141TabSelected() && DOM.bip141semantics.val() == "p2wsh";
    }

    function p2wshInP2shSelected() {
        return (bip141TabSelected() && DOM.bip141semantics.val() == "p2wsh-p2sh");
    }

    function TableRow(index, isLast) {

        var self = this;
        this.shouldGenerate = true;
        var useHardenedAddresses = DOM.hardenedAddresses.prop("checked");
        var useBip38 = DOM.useBip38.prop("checked");
        var bip38password = DOM.bip38Password.val();
        var isSegwit = segwitSelected();
        var segwitAvailable = networkHasSegwit();
        var isP2wpkh = p2wpkhSelected();
        var isP2wpkhInP2sh = p2wpkhInP2shSelected();
        var isP2wsh = p2wshSelected();
        var isP2wshInP2sh = p2wshInP2shSelected();

        function init() {
            calculateValues();
        }

        function calculateValues() {
            setTimeout(function() {
                if (!self.shouldGenerate) {
                    return;
                }
                // derive HDkey for this row of the table
                var key = "NA";
                if (useHardenedAddresses) {
                    key = bip32ExtendedKey.deriveHardened(index);
                }
                else {
                    key = bip32ExtendedKey.derive(index);
                }
                // bip38 requires uncompressed keys
                // see https://github.com/iancoleman/bip39/issues/140#issuecomment-352164035
                var keyPair = key.keyPair;
                var useUncompressed = useBip38;
                if (useUncompressed) {
                    keyPair = new libs.bitcoin.ECPair(keyPair.d, null, { network: network, compressed: false });
                    if(isGRS())
                        keyPair = new libs.groestlcoinjs.ECPair(keyPair.d, null, { network: network, compressed: false });

                }
                // get address
                var address = keyPair.getAddress().toString();
                // get privkey
                var hasPrivkey = !key.isNeutered();
                var privkey = "NA";
                if (hasPrivkey) {
                    privkey = keyPair.toWIF();
                    // BIP38 encode private key if required
                    if (useBip38) {
                        if(isGRS())
                            privkey = libs.groestlcoinjsBip38.encrypt(keyPair.d.toBuffer(), false, bip38password, function(p) {
                                console.log("Progressed " + p.percent.toFixed(1) + "% for index " + index);
                            }, null, networks[DOM.network.val()].name.includes("Testnet"));
                        else
                            privkey = libs.bip38.encrypt(keyPair.d.toBuffer(), false, bip38password, function(p) {
                                console.log("Progressed " + p.percent.toFixed(1) + "% for index " + index);
                            });
                    }
                }
                // get pubkey
                var pubkey = keyPair.getPublicKeyBuffer().toString('hex');
                var indexText = getDerivationPath() + "/" + index;
                if (useHardenedAddresses) {
                    indexText = indexText + "'";
                }
                // Ethereum values are different
                if (networkIsEthereum()) {
                    var pubkeyBuffer = keyPair.getPublicKeyBuffer();
                    var ethPubkey = libs.ethUtil.importPublic(pubkeyBuffer);
                    var addressBuffer = libs.ethUtil.publicToAddress(ethPubkey);
                    var hexAddress = addressBuffer.toString('hex');
                    var checksumAddress = libs.ethUtil.toChecksumAddress(hexAddress);
                    address = libs.ethUtil.addHexPrefix(checksumAddress);
                    pubkey = libs.ethUtil.addHexPrefix(pubkey);
                    if (hasPrivkey) {
                        privkey = libs.ethUtil.bufferToHex(keyPair.d.toBuffer(32));
                    }
                }
                // TRX is different
                if (networks[DOM.network.val()].name == "TRX - Tron") {
                    keyPair = new libs.bitcoin.ECPair(keyPair.d, null, { network: network, compressed: false });
                    var pubkeyBuffer = keyPair.getPublicKeyBuffer();
                    var ethPubkey = libs.ethUtil.importPublic(pubkeyBuffer);
                    var addressBuffer = libs.ethUtil.publicToAddress(ethPubkey);
                    address = libs.bitcoin.address.toBase58Check(addressBuffer, 0x41);
                    if (hasPrivkey) {
                        privkey = keyPair.d.toBuffer().toString('hex');
                    }
                }
                // RSK values are different
                if (networkIsRsk()) {
                    var pubkeyBuffer = keyPair.getPublicKeyBuffer();
                    var ethPubkey = libs.ethUtil.importPublic(pubkeyBuffer);
                    var addressBuffer = libs.ethUtil.publicToAddress(ethPubkey);
                    var hexAddress = addressBuffer.toString('hex');
                    // Use chainId based on selected network
                    // Ref: https://developers.rsk.co/rsk/architecture/account-based/#chainid
                    var chainId;
                    var rskNetworkName = networks[DOM.network.val()].name;
                    switch (rskNetworkName) {
                        case "R-BTC - RSK":
                            chainId = 30;
                            break;
                        case "tR-BTC - RSK Testnet":
                            chainId = 31;
                            break;
                        default:
                            chainId = null;
                    }
                    var checksumAddress = toChecksumAddressForRsk(hexAddress, chainId);
                    address = libs.ethUtil.addHexPrefix(checksumAddress);
                    pubkey = libs.ethUtil.addHexPrefix(pubkey);
                    if (hasPrivkey) {
                        privkey = libs.ethUtil.bufferToHex(keyPair.d.toBuffer());
                    }
                }
                // Handshake values are different
                if (networks[DOM.network.val()].name == "HNS - Handshake") {
                    var ring = libs.handshake.KeyRing.fromPublic(keyPair.getPublicKeyBuffer())
                    address = ring.getAddress().toString();
                }
                // Stellar is different
                if (networks[DOM.network.val()].name == "XLM - Stellar") {
                    var purpose = parseIntNoNaN(DOM.bip44purpose.val(), 44);
                    var coin = parseIntNoNaN(DOM.bip44coin.val(), 0);
                    var path = "m/";
                        path += purpose + "'/";
                        path += coin + "'/" + index + "'";
                    var keypair = libs.stellarUtil.getKeypair(path, seed);
                    indexText = path;
                    privkey = keypair.secret();
                    pubkey = address = keypair.publicKey();
                }
                // Nano currency
                if (networks[DOM.network.val()].name == "NANO - Nano") {
                    var nanoKeypair = libs.nanoUtil.getKeypair(index, seed);
                    privkey = nanoKeypair.privKey;
                    pubkey = nanoKeypair.pubKey;
                    address = nanoKeypair.address;
                }
                if ((networks[DOM.network.val()].name == "NAS - Nebulas")) {
                    var privKeyBuffer = keyPair.d.toBuffer(32);
                    var nebulasAccount = libs.nebulas.Account.NewAccount();
                    nebulasAccount.setPrivateKey(privKeyBuffer);
                    address = nebulasAccount.getAddressString();
                    privkey = nebulasAccount.getPrivateKeyString();
                    pubkey = nebulasAccount.getPublicKeyString();
                }
                // Ripple values are different
                if (networks[DOM.network.val()].name == "XRP - Ripple") {
                    privkey = convertRipplePriv(privkey);
                    address = convertRippleAdrr(address);
                }
                // Jingtum values are different
                if (networks[DOM.network.val()].name == "SWTC - Jingtum") {
                    privkey = convertJingtumPriv(privkey);
                    address = convertJingtumAdrr(address);
                }
                // CasinoCoin values are different
                if (networks[DOM.network.val()].name == "CSC - CasinoCoin") {
                    privkey = convertCasinoCoinPriv(privkey);
                    address = convertCasinoCoinAdrr(address);
                }
                // Bitcoin Cash address format may vary
                if (networks[DOM.network.val()].name == "BCH - Bitcoin Cash") {
                    var bchAddrType = DOM.bitcoinCashAddressType.filter(":checked").val();
                    if (bchAddrType == "cashaddr") {
                        address = libs.bchaddr.toCashAddress(address);
                    }
                    else if (bchAddrType == "bitpay") {
                        address = libs.bchaddr.toBitpayAddress(address);
                    }
                }
                // Bitcoin Cash address format may vary
                if (networks[DOM.network.val()].name == "SLP - Simple Ledger Protocol") {
                     var bchAddrType = DOM.bitcoinCashAddressType.filter(":checked").val();
                     if (bchAddrType == "cashaddr") {
                         address = libs.bchaddrSlp.toSlpAddress(address);
                     }
                 }
                // ZooBC address format may vary
                if (networks[DOM.network.val()].name == "ZBC - ZooBlockchain") {

                    var purpose = parseIntNoNaN(DOM.bip44purpose.val(), 44);
                    var coin = parseIntNoNaN(DOM.bip44coin.val(), 0);
                    var path = "m/";
                        path += purpose + "'/";
                        path += coin + "'/" + index + "'";
                    var result = libs.zoobcUtil.getKeypair(path, seed);

                    let publicKey = result.pubKey.slice(1, 33);
                    let privateKey = result.key;

                    privkey = privateKey.toString('hex');
                    pubkey = publicKey.toString('hex');

                    indexText = path;
                    address = libs.zoobcUtil.getZBCAddress(publicKey, 'ZBC');
                }
                // Segwit addresses are different
                if (isSegwit) {
                    if (!segwitAvailable) {
                        return;
                    }
                    if (isP2wpkh) {
                        var keyhash = libs.bitcoin.crypto.hash160(key.getPublicKeyBuffer());
                        var scriptpubkey = libs.bitcoin.script.witnessPubKeyHash.output.encode(keyhash);
                        address = libs.bitcoin.address.fromOutputScript(scriptpubkey, network)
                    }
                    else if (isP2wpkhInP2sh) {
                        var keyhash = libs.bitcoin.crypto.hash160(key.getPublicKeyBuffer());
                        var scriptsig = libs.bitcoin.script.witnessPubKeyHash.output.encode(keyhash);
                        var addressbytes = libs.bitcoin.crypto.hash160(scriptsig);
                        var scriptpubkey = libs.bitcoin.script.scriptHash.output.encode(addressbytes);
                        address = libs.bitcoin.address.fromOutputScript(scriptpubkey, network)
                    }
                    else if (isP2wsh) {
                        // https://github.com/libs.bitcoinjs-lib/blob/v3.3.2/test/integration/addresses.js#L71
                        // This is a 1-of-1
                        var witnessScript = libs.bitcoin.script.multisig.output.encode(1, [key.getPublicKeyBuffer()]);
                        var scriptPubKey = libs.bitcoin.script.witnessScriptHash.output.encode(libs.bitcoin.crypto.sha256(witnessScript));
                        address = libs.bitcoin.address.fromOutputScript(scriptPubKey, network);
                    }
                    else if (isP2wshInP2sh) {
                        // https://github.com/libs.bitcoinjs-lib/blob/v3.3.2/test/integration/transactions.js#L183
                        // This is a 1-of-1
                        var witnessScript = libs.bitcoin.script.multisig.output.encode(1, [key.getPublicKeyBuffer()]);
                        var redeemScript = libs.bitcoin.script.witnessScriptHash.output.encode(libs.bitcoin.crypto.sha256(witnessScript));
                        var scriptPubKey = libs.bitcoin.script.scriptHash.output.encode(libs.bitcoin.crypto.hash160(redeemScript));
                        address = libs.bitcoin.address.fromOutputScript(scriptPubKey, network)
                    }
                }

                if ((networks[DOM.network.val()].name == "CRW - Crown")) {
                    address = libs.bitcoin.networks.crown.toNewAddress(address);
                }

                if (networks[DOM.network.val()].name == "EOS - EOSIO") {
                    address = ""
                    pubkey = EOSbufferToPublic(keyPair.getPublicKeyBuffer());
                    privkey = EOSbufferToPrivate(keyPair.d.toBuffer(32));
                }

                if (networks[DOM.network.val()].name == "FIO - Foundation for Interwallet Operability") {
                    address = ""
                    pubkey = FIObufferToPublic(keyPair.getPublicKeyBuffer());
                    privkey = FIObufferToPrivate(keyPair.d.toBuffer(32));
                }

                if (networks[DOM.network.val()].name == "ATOM - Cosmos Hub") {
                    const hrp = "cosmos";
                    address = CosmosBufferToAddress(keyPair.getPublicKeyBuffer(), hrp);
                    pubkey = CosmosBufferToPublic(keyPair.getPublicKeyBuffer(), hrp);
                    privkey = keyPair.d.toBuffer().toString("base64");
                }

                if (networks[DOM.network.val()].name == "RUNE - THORChain") {
                     const hrp = "thor";
                     address = CosmosBufferToAddress(keyPair.getPublicKeyBuffer(), hrp);
                     pubkey = keyPair.getPublicKeyBuffer().toString("hex");
                     privkey = keyPair.d.toBuffer().toString("hex");
                }

                if (networks[DOM.network.val()].name == "XWC - Whitecoin"){
                    address = XWCbufferToAddress(keyPair.getPublicKeyBuffer());
                    pubkey = XWCbufferToPublic(keyPair.getPublicKeyBuffer());
                    privkey = XWCbufferToPrivate(keyPair.d.toBuffer(32));
                }

                if (networks[DOM.network.val()].name == "LUNA - Terra") {
                    const hrp = "terra";
                    address = CosmosBufferToAddress(keyPair.getPublicKeyBuffer(), hrp);
                    pubkey = keyPair.getPublicKeyBuffer().toString("hex");
                    privkey = keyPair.d.toBuffer().toString("hex");
                }

                if (networks[DOM.network.val()].name == "IOV - Starname") {
                  const hrp = "star";
                  address = CosmosBufferToAddress(keyPair.getPublicKeyBuffer(), hrp);
                  pubkey = CosmosBufferToPublic(keyPair.getPublicKeyBuffer(), hrp);
                  privkey = keyPair.d.toBuffer().toString("base64");
                }toString

              //Groestlcoin Addresses are different
                if(isGRS()) {

                    if (isSegwit) {
                        if (!segwitAvailable) {
                            return;
                        }
                        if (isP2wpkh) {
                            address = libs.groestlcoinjs.address.fromOutputScript(scriptpubkey, network)
                        }
                        else if (isP2wpkhInP2sh) {
                            address = libs.groestlcoinjs.address.fromOutputScript(scriptpubkey, network)
                        }
                    }
                    //non-segwit addresses are handled by using groestlcoinjs for bip32RootKey
                }

                if (isELA()) {
                    let elaAddress = calcAddressForELA(
                        seed,
                        parseIntNoNaN(DOM.bip44coin.val(), 0),
                        parseIntNoNaN(DOM.bip44account.val(), 0),
                        parseIntNoNaN(DOM.bip44change.val(), 0),
                        index
                    );
                    address = elaAddress.address;
                    privkey = elaAddress.privateKey;
                    pubkey = elaAddress.publicKey;
                }

                addAddressToList(indexText, address, pubkey, privkey);
                if (isLast) {
                    hidePending();
                    updateCsv();
                }
            }, 50)
        }

        init();

    }

    function showMore() {
        var rowsToAdd = parseInt(DOM.rowsToAdd.val());
        if (isNaN(rowsToAdd)) {
            rowsToAdd = 20;
            DOM.rowsToAdd.val("20");
        }
        var start = parseInt(DOM.moreRowsStartIndex.val())
        if (isNaN(start)) {
            start = lastIndexInTable() + 1;
        }
        else {
            var newStart = start + rowsToAdd;
            DOM.moreRowsStartIndex.val(newStart);
        }
        if (rowsToAdd > 200) {
            var msg = "Generating " + rowsToAdd + " rows could take a while. ";
            msg += "Do you want to continue?";
            if (!confirm(msg)) {
                return;
            }
        }
        displayAddresses(start, rowsToAdd);

    }

    function clearDisplay() {
        DOM.combineParts.val("");
        clearAddressesList();
        clearKeys();
        hideValidationError();
    }

    function clearAddressesList() {
        DOM.addresses.empty();
        DOM.csv.val("");
        stopGenerating();
    }

    function stopGenerating() {
        while (generationProcesses.length > 0) {
            var generation = generationProcesses.shift();
            generation.stop();
        }
    }

    function clearKeys() {
        clearRootKey();
        clearDerivedKeys();
    }

    function clearRootKey() {
        DOM.rootKey.val("");
    }

    function clearDerivedKeys() {
        DOM.extendedPrivKey.val("");
        DOM.extendedPubKey.val("");
        DOM.bip44accountXprv.val("");
        DOM.bip44accountXpub.val("");
    }

    function addAddressToList(indexText, address, pubkey, privkey) {
        var row = $(addressRowTemplate.html());
        // Elements
        var indexCell = row.find(".index span");
        var addressCell = row.find(".address span");
        var pubkeyCell = row.find(".pubkey span");
        var privkeyCell = row.find(".privkey span");
        // Content
        indexCell.text(indexText);
        if (networks[DOM.network.val()].name !== "ETH - Ethereum (Consensus Layer)") {
          addressCell.text(address);
        }
        pubkeyCell.text(pubkey);
        privkeyCell.text(privkey);
        // Visibility
        if (!showIndex) {
            indexCell.addClass("invisible");
        }
        if (!showAddress) {
            addressCell.addClass("invisible");
        }
        if (!showPubKey) {
            pubkeyCell.addClass("invisible");
        }
        if (!showPrivKey) {
            privkeyCell.addClass("invisible");
        }
        DOM.addresses.append(row);
        var rowShowQrEls = row.find("[data-show-qr]");
        setQrEvents(rowShowQrEls);
    }

    function hasStrongRandom() {
        return 'crypto' in window && window['crypto'] !== null;
    }

    function disableForms() {
        $("form").on("submit", function(e) {
            e.preventDefault();
        });
    }

    function parseIntNoNaN(val, defaultVal) {
        var v = parseInt(val);
        if (isNaN(v)) {
            return defaultVal;
        }
        return v;
    }

    function showPending() {
        DOM.feedback
            .text("Calculating...")
            .show();
    }

    function findNearestWord(word) {
        var language = getLanguage();
        var words = WORDLISTS[language];
        var minDistance = 99;
        var closestWord = words[0];
        for (var i=0; i<words.length; i++) {
            var comparedTo = words[i];
            if (comparedTo.indexOf(word) == 0) {
                return comparedTo;
            }
            var distance = libs.levenshtein.get(word, comparedTo);
            if (distance < minDistance) {
                closestWord = comparedTo;
                minDistance = distance;
            }
        }
        return closestWord;
    }

    function hidePending() {
        DOM.feedback
            .text("")
            .hide();
    }

    function populateNetworkSelect() {
        for (var i=0; i<networks.length; i++) {
            var network = networks[i];
            var option = $("<option>");
            option.attr("value", i);
            option.text(network.name);
            // if (network.name == "BTC - Bitcoin") {
            if (network.name == "ETH - Ethereum (Execution Layer)") {
                option.prop("selected", true);
            }
            DOM.phraseNetwork.append(option);
        }
    }

    function populateClientSelect() {
        for (var i=0; i<clients.length; i++) {
            var client = clients[i];
            var option = $("<option>");
            option.attr("value", i);
            option.text(client.name);

            if (client.name == "Coinomi, Ledger") {
                option.prop("selected", true);
                option.prop("readonly", true);
            }

            DOM.bip32Client.append(option);
        }
    }

    function getLanguage() {
        var defaultLanguage = "english";
        // Try to get from existing phrase
        var language = getLanguageFromPhrase();
        // Try to get from url if not from phrase
        if (language.length == 0) {
            language = getLanguageFromUrl();
        }
        // Default to English if no other option
        if (language.length == 0) {
            language = defaultLanguage;
        }
        return language;
    }

    function getLanguageFromPhrase(phrase) {
        // Check if how many words from existing phrase match a language.
        var language = "";
        if (!phrase) {
            phrase = DOM.phrase.val();
        }
        if (phrase.length > 0) {
            var words = phraseToWordArray(phrase);
            var languageMatches = {};
            for (l in WORDLISTS) {
                // Track how many words match in this language
                languageMatches[l] = 0;
                for (var i=0; i<words.length; i++) {
                    var wordInLanguage = WORDLISTS[l].indexOf(words[i]) > -1;
                    if (wordInLanguage) {
                        languageMatches[l]++;
                    }
                }
                // Find languages with most word matches.
                // This is made difficult due to commonalities between Chinese
                // simplified vs traditional.
                var mostMatches = 0;
                var mostMatchedLanguages = [];
                for (var l in languageMatches) {
                    var numMatches = languageMatches[l];
                    if (numMatches > mostMatches) {
                        mostMatches = numMatches;
                        mostMatchedLanguages = [l];
                    }
                    else if (numMatches == mostMatches) {
                        mostMatchedLanguages.push(l);
                    }
                }
            }
            if (mostMatchedLanguages.length > 0) {
                // Use first language and warn if multiple detected
                language = mostMatchedLanguages[0];
                if (mostMatchedLanguages.length > 1) {
                    console.warn("Multiple possible languages");
                    console.warn(mostMatchedLanguages);
                }
            }
        }
        return language;
    }

    function getLanguageFromUrl() {
        for (var language in WORDLISTS) {
            if (window.location.hash.indexOf(language) > -1) {
                return language;
            }
        }
        return "";
    }

    function setMnemonicLanguage() {
        var language = getLanguage();
        // Load the bip39 mnemonic generator for this language if required
        if (!(language in mnemonics)) {
            mnemonics[language] = new Mnemonic(language);
        }
        mnemonic = mnemonics[language];
    }

    function convertPhraseToNewLanguage() {
        var oldLanguage = getLanguageFromPhrase();
        var newLanguage = getLanguageFromUrl();
        var oldPhrase = DOM.phrase.val();
        var oldWords = phraseToWordArray(oldPhrase);
        var newWords = [];
        for (var i=0; i<oldWords.length; i++) {
            var oldWord = oldWords[i];
            var index = WORDLISTS[oldLanguage].indexOf(oldWord);
            var newWord = WORDLISTS[newLanguage][index];
            newWords.push(newWord);
        }
        newPhrase = wordArrayToPhrase(newWords);
        return newPhrase;
    }

    // TODO look at jsbip39 - mnemonic.splitWords
    function phraseToWordArray(phrase) {
        var words = phrase.split(/\s/g);
        var noBlanks = [];
        for (var i=0; i<words.length; i++) {
            var word = words[i];
            if (word.length > 0) {
                noBlanks.push(word);
            }
        }
        return noBlanks;
    }

    // TODO look at jsbip39 - mnemonic.joinWords
    function wordArrayToPhrase(words) {
        var phrase = words.join(" ");
        var language = getLanguageFromPhrase(phrase);
        if (language == "japanese") {
            phrase = words.join("\u3000");
        }
        return phrase;
    }

    function writeSplitPhrase(phrase) {
        var wordCount = phrase.split(/\s/g).length;
        var left=[];
        for (var i=0;i<wordCount;i++) left.push(i);
        var group=[[],[],[]],
            groupI=-1;
        var seed = Math.abs(sjcl.hash.sha256.hash(phrase)[0])% 2147483647;

        while (left.length>0) {
            groupI=(groupI+1)%3;
            seed = seed * 16807 % 2147483647;
            var selected=Math.floor(left.length*(seed - 1) / 2147483646);
            group[groupI].push(left[selected]);
            left.splice(selected,1);
        }
        var cards=[phrase.split(/\s/g),phrase.split(/\s/g),phrase.split(/\s/g)];
        for (var i=0;i<3;i++) {
            for (var ii=0;ii<wordCount/3;ii++) cards[i][group[i][ii]]='XXXX';
            cards[i]='Card '+(i+1)+': '+wordArrayToPhrase(cards[i]);
        }
        DOM.phraseSplit.val(cards.join("\r\n"));
        var triesPerSecond=10000000000;
        var hackTime=Math.pow(2,wordCount*10/3)/triesPerSecond;
        var displayRedText = false;
        if (hackTime<1) {
            hackTime="<1 second";
            displayRedText = true;
        } else if (hackTime<86400) {
            hackTime=Math.floor(hackTime)+" seconds";
            displayRedText = true;
        } else if(hackTime<31557600) {
            hackTime=Math.floor(hackTime/86400)+" days";
            displayRedText = true;
        } else {
            hackTime=Math.floor(hackTime/31557600)+" years";
        }
        DOM.phraseSplitWarn.html("Time to hack with only one card: "+hackTime);
        if (displayRedText) {
            DOM.phraseSplitWarn.addClass("text-danger");
        } else {
            DOM.phraseSplitWarn.removeClass("text-danger");
        }
    }

    function isUsingOwnEntropy() {
        return DOM.useEntropy.prop("checked");
    }

    function setMnemonicFromEntropy() {
        clearEntropyFeedback();
        // Get entropy value
        var entropyStr = DOM.entropy.val();
        // Work out minimum base for entropy
        var entropy = null;
        if (entropyTypeAutoDetect) {
            entropy = Entropy.fromString(entropyStr);
        }
        else {
            let base = DOM.entropyTypeInputs.filter(":checked").val();
            entropy = Entropy.fromString(entropyStr, base);
        }
        if (entropy.binaryStr.length == 0) {
            return;
        }
        // Show entropy details
        showEntropyFeedback(entropy);
        // Use entropy hash if not using raw entropy
        var bits = entropy.binaryStr;
        var mnemonicLength = DOM.entropyMnemonicLength.val();
        if (mnemonicLength != "raw") {
            // Get bits by hashing entropy with SHA256
            var hash = sjcl.hash.sha256.hash(entropy.cleanStr);
            var hex = sjcl.codec.hex.fromBits(hash);
            bits = libs.BigInteger.BigInteger.parse(hex, 16).toString(2);
            while (bits.length % 256 != 0) {
                bits = "0" + bits;
            }
            // Truncate hash to suit number of words
            mnemonicLength = parseInt(mnemonicLength);
            var numberOfBits = 32 * mnemonicLength / 3;
            bits = bits.substring(0, numberOfBits);
            // show warning for weak entropy override
            if (mnemonicLength / 3 * 32 > entropy.binaryStr.length) {
                DOM.entropyWeakEntropyOverrideWarning.removeClass("hidden");
            }
            else {
                DOM.entropyWeakEntropyOverrideWarning.addClass("hidden");
            }
        }
        else {
            // hide warning for weak entropy override
            DOM.entropyWeakEntropyOverrideWarning.addClass("hidden");
        }
        // Discard trailing entropy
        var bitsToUse = Math.floor(bits.length / 32) * 32;
        var start = bits.length - bitsToUse;
        var binaryStr = bits.substring(start);
        // Convert entropy string to numeric array
        var entropyArr = [];
        for (var i=0; i<binaryStr.length / 8; i++) {
            var byteAsBits = binaryStr.substring(i*8, i*8+8);
            var entropyByte = parseInt(byteAsBits, 2);
            entropyArr.push(entropyByte)
        }
        // Convert entropy array to mnemonic
        var phrase = mnemonic.toMnemonic(entropyArr);
        // Set the mnemonic in the UI
        DOM.phrase.val(phrase);
        writeSplitPhrase(phrase);
        // Show the word indexes
        showWordIndexes();
        // Show the checksum
        showChecksum();
    }


    // Start of Shamir39 split phrase section
    function reconstruct() {
        html5QrcodeScanner.clear();
        scanQr = false;
        var partsStr = DOM.combineParts.val();
        hideValidationError();
        showValidationError("Reconstructing ...");
        setTimeout(function() {
            showCombinedPhrase(partsStr);
        }, 50);
    }

    function showSplitPhrase() {
        hideValidationError();
        var phrase = DOM.phrase.val();
        var words = phraseToWordArray(phrase);
        var m = parseInt(DOM.parameterM.val());
        var n = parseInt(DOM.parameterN.val());
        if (m > n) {
          showValidationError("Number of required parts can not be greater than number of all parts.");
          return;
        }
        var language = getLanguage(phrase);
        var wordlist = WORDLISTS[language];
        var parts = shamir39.split(words, wordlist, m, n);
        if ("error" in parts) {
            showValidationError(parts.error);
            return;
        }
        // Convert mnemonics into phrases
        var mnemonics = parts.mnemonics;
        for (var i=0; i<mnemonics.length; i++) {
          mnemonics[i] = wordArrayToPhrase(mnemonics[i]);
        }
        var partsStr = mnemonics.join("\n\n");
        DOM.splitParts.val(partsStr);
    }

    function showCombinedPhrase(partsStr) {
      // extract parts from string
      var partsDirty = partsStr.split("\n");
      var parts = [];
      for (var i=0; i<partsDirty.length; i++) {
          var part = partsDirty[i];
          part = part.trim();
          if (part.length > 0) {
              parts.push(part);
          }
      }
      // convert phrases to word arrays
      var mnemonics = [];
      for (var i=0; i<parts.length; i++) {
          var part = parts[i];
          var mnemonic = phraseToWordArray(part);
          mnemonics.push(mnemonic);
      }
      // combine the phrases into the original mnemonic
      var language = getLanguage(parts[0]);
      var wordlist = WORDLISTS[language];
      var words = shamir39.combine(mnemonics, wordlist);
      if ("error" in words && words.error !== "Inconsisent M parameters") {
        if (scanQr){
          showQrError(words.error + " unique parts. Scan next part!");
          return;
        } else {
          showValidationError(words.error + " unique parts. Proceed with next part!");
          return;
        }
      }
      else if ("error" in words && words.error === "Inconsisent M parameters"){
        if (scanQr){
          showQrError(words.error + ". Scan a part from the same set!");
          parts.shift();
          DOM.combineParts.val(parts.join("\n"));
          return;
        } else {
          showValidationError(words.error + ". Parts are not from the same set!");
          parts.pop();
          DOM.combineParts.val(parts.join("\n"));
          return;
        }
      }

      DOM.qrError.hide();

      if(scanQr){
        toggleQrScan();
        lastResult = 0;
        countResults = 0;
        current = 0;
      }

      hideValidationError();
      showValidationError("Reconstructing ...");
      var phrase = wordArrayToPhrase(words.mnemonic);
      DOM.phrase.val(phrase);
      delayedPhraseChanged();
    }

    // End of Shamir39 split phrase section

    function clearEntropyFeedback() {
        DOM.entropyCrackTime.text("...");
        DOM.entropyType.text("");
        DOM.entropyWordCount.text("0");
        DOM.entropyEventCount.text("0");
        DOM.entropyBitsPerEvent.text("0");
        DOM.entropyBits.text("0");
        DOM.entropyFiltered.html("&nbsp;");
        DOM.entropyBinary.html("&nbsp;");
    }

    function showEntropyFeedback(entropy) {
        var numberOfBits = entropy.binaryStr.length;
        var timeToCrack = "unknown";
        try {
            var z = libs.zxcvbn(entropy.base.events.join(""));
            timeToCrack = z.crack_times_display.offline_fast_hashing_1e10_per_second;
            if (z.feedback.warning != "") {
                timeToCrack = timeToCrack + " - " + z.feedback.warning;
            };
        }
        catch (e) {
            console.log("Error detecting entropy strength with zxcvbn:");
            console.log(e);
        }
        var entropyTypeStr = getEntropyTypeStr(entropy);
        DOM.entropyTypeInputs.attr("checked", false);
        DOM.entropyTypeInputs.filter("[value='" + entropyTypeStr + "']").attr("checked", true);
        var wordCount = Math.floor(numberOfBits / 32) * 3;
        var bitsPerEvent = entropy.bitsPerEvent.toFixed(2);
        var spacedBinaryStr = addSpacesEveryElevenBits(entropy.binaryStr);
        DOM.entropyFiltered.html(entropy.cleanHtml);
        DOM.entropyType.text(entropyTypeStr);
        DOM.entropyCrackTime.text(timeToCrack);
        DOM.entropyEventCount.text(entropy.base.events.length);
        DOM.entropyBits.text(numberOfBits);
        DOM.entropyWordCount.text(wordCount);
        DOM.entropyBinary.text(spacedBinaryStr);
        DOM.entropyBitsPerEvent.text(bitsPerEvent);
        // detect and warn of filtering
        var rawNoSpaces = DOM.entropy.val().replace(/\s/g, "");
        var cleanNoSpaces = entropy.cleanStr.replace(/\s/g, "");
        var isFiltered = rawNoSpaces.length != cleanNoSpaces.length;
        if (isFiltered) {
            DOM.entropyFilterWarning.removeClass('hidden');
        }
        else {
            DOM.entropyFilterWarning.addClass('hidden');
        }
    }

    function getEntropyTypeStr(entropy) {
        var typeStr = entropy.base.str;
        // Add some detail if these are cards
        if (entropy.base.asInt == 52) {
            var cardDetail = []; // array of message strings
            // Detect duplicates
            var dupes = [];
            var dupeTracker = {};
            for (var i=0; i<entropy.base.events.length; i++) {
                var card = entropy.base.events[i];
                var cardUpper = card.toUpperCase();
                if (cardUpper in dupeTracker) {
                    dupes.push(card);
                }
                dupeTracker[cardUpper] = true;
            }
            if (dupes.length > 0) {
                var dupeWord = "duplicates";
                if (dupes.length == 1) {
                    dupeWord = "duplicate";
                }
                var msg = dupes.length + " " + dupeWord + ": " + dupes.slice(0,3).join(" ");
                if (dupes.length > 3) {
                    msg += "...";
                }
                cardDetail.push(msg);
            }
            // Detect full deck
            var uniqueCards = [];
            for (var uniqueCard in dupeTracker) {
                uniqueCards.push(uniqueCard);
            }
            if (uniqueCards.length == 52) {
                cardDetail.unshift("full deck");
            }
            // Detect missing cards
            var values = "A23456789TJQK";
            var suits = "CDHS";
            var missingCards = [];
            for (var i=0; i<suits.length; i++) {
                for (var j=0; j<values.length; j++) {
                    var card = values[j] + suits[i];
                    if (!(card in dupeTracker)) {
                        missingCards.push(card);
                    }
                }
            }
            // Display missing cards if six or less, ie clearly going for full deck
            if (missingCards.length > 0 && missingCards.length <= 6) {
                var msg = missingCards.length + " missing: " + missingCards.slice(0,3).join(" ");
                if (missingCards.length > 3) {
                    msg += "...";
                }
                cardDetail.push(msg);
            }
            // Add card details to typeStr
            if (cardDetail.length > 0) {
                typeStr += " (" + cardDetail.join(", ") + ")";
            }
        }
        return typeStr;
    }

    function setQrEvents(els) {
        els.on("mouseenter", createQr);
        els.on("mouseleave", destroyQr);
        els.on("click", toggleQr);
    }

    function createQr(e) {
        var content = e.target.textContent || e.target.value;
        if (content) {
            var qrEl = libs.kjua({
                text: content,
                render: "canvas",
                size: 310,
                ecLevel: 'H',
            });
            DOM.qrImage.append(qrEl);
            if (!showQr) {
                DOM.qrHider.addClass("hidden");
            }
            else {
                DOM.qrHider.removeClass("hidden");
            }
            DOM.qrContainer.removeClass("hidden");
        }
    }

    function destroyQr() {
        DOM.qrImage.text("");
        DOM.qrContainer.addClass("hidden");
    }

    function toggleQr() {
        showQr = !showQr;
        DOM.qrHider.toggleClass("hidden");
        DOM.qrHint.toggleClass("hidden");
    }

    function bip44TabSelected() {
        return DOM.bip44tab.hasClass("active");
    }

    function bip32TabSelected() {
        return DOM.bip32tab.hasClass("active");
    }

    function networkIsEthereum() {
        var name = networks[DOM.network.val()].name;
        return (name == "ETH - Ethereum (Execution Layer)")
                    || (name == "ETC - Ethereum Classic")
                    || (name == "EWT - EnergyWeb")
                    || (name == "PIRL - Pirl")
                    || (name == "MIX - MIX")
                    || (name == "MOAC - MOAC")
                    || (name == "MUSIC - Musicoin")
                    || (name == "POA - Poa")
                    || (name == "EXP - Expanse")
                    || (name == "CLO - Callisto")
                    || (name == "DXN - DEXON")
                    || (name == "ELLA - Ellaism")
                    || (name == "ESN - Ethersocial Network")
                    || (name == "VET - VeChain")
                    || (name == "ERE - EtherCore")
                    || (name == "BSC - Binance Smart Chain")
    }

    function networkIsRsk() {
        var name = networks[DOM.network.val()].name;
        return (name == "R-BTC - RSK")
            || (name == "tR-BTC - RSK Testnet");
    }

    function networkHasSegwit() {
        var n = network;
        if ("baseNetwork" in network) {
            n = libs.bitcoin.networks[network.baseNetwork];
        }
        // check if only p2wpkh params are required
        if (p2wpkhSelected()) {
            return "p2wpkh" in n;
        }
        // check if only p2wpkh-in-p2sh params are required
        else if (p2wpkhInP2shSelected()) {
            return "p2wpkhInP2sh" in n;
        }
        // require both if it's unclear which params are required
        return "p2wpkh" in n && "p2wpkhInP2sh" in n;
    }

    function bip49TabSelected() {
        return DOM.bip49tab.hasClass("active");
    }

    function bip84TabSelected() {
        return DOM.bip84tab.hasClass("active");
    }

    function bip141TabSelected() {
        return DOM.bip141tab.hasClass("active");
    }

    function eip2334TabSelected() {
        return DOM.eip2334tab.hasClass("active");
    }

    function setHdCoin(coinValue) {
        DOM.bip44coin.val(coinValue);
        DOM.bip49coin.val(coinValue);
        DOM.bip84coin.val(coinValue);
    }

    function showSegwitAvailable() {
        DOM.bip49unavailable.addClass("hidden");
        DOM.bip49available.removeClass("hidden");
        DOM.bip84unavailable.addClass("hidden");
        DOM.bip84available.removeClass("hidden");
        DOM.bip141unavailable.addClass("hidden");
        DOM.bip141available.removeClass("hidden");
    }

    function showSegwitUnavailable() {
        DOM.bip49available.addClass("hidden");
        DOM.bip49unavailable.removeClass("hidden");
        DOM.bip84available.addClass("hidden");
        DOM.bip84unavailable.removeClass("hidden");
        DOM.bip141available.addClass("hidden");
        DOM.bip141unavailable.removeClass("hidden");
    }

    function adjustNetworkForSegwit() {
        // If segwit is selected the xpub/xprv prefixes need to be adjusted
        // to avoid accidentally importing BIP49 xpub to BIP44 watch only
        // wallet.
        // See https://github.com/iancoleman/bip39/issues/125
        var segwitNetworks = null;
        // if a segwit network is alread selected, need to use base network to
        // look up new parameters
        if ("baseNetwork" in network) {
            network = libs.bitcoin.networks[network.baseNetwork];
        }
        // choose the right segwit params
        if (p2wpkhSelected() && "p2wpkh" in network) {
            network = network.p2wpkh;
        }
        else if (p2wpkhInP2shSelected() && "p2wpkhInP2sh" in network) {
            network = network.p2wpkhInP2sh;
        }
        else if (p2wshSelected() && "p2wsh" in network) {
            network = network.p2wsh;
        }
        else if (p2wshInP2shSelected() && "p2wshInP2sh" in network) {
            network = network.p2wshInP2sh;
        }
    }

    function lastIndexInTable() {
        var pathText = DOM.addresses.find(".index").last().text();
        var pathBits = pathText.split("/");
        var lastBit = pathBits[pathBits.length-1];
        var lastBitClean = lastBit.replace("'", "");
        return parseInt(lastBitClean);
    }

    function uint8ArrayToHex(a) {
        var s = ""
        for (var i=0; i<a.length; i++) {
            var h = a[i].toString(16);
            while (h.length < 2) {
                h = "0" + h;
            }
            s = s + h;
        }
        return s;
    }

    function showWordIndexes() {
        var phrase = DOM.phrase.val();
        var words = phraseToWordArray(phrase);
        var wordIndexes = [];
        var language = getLanguage();
        for (var i=0; i<words.length; i++) {
            var word = words[i];
            var wordIndex = WORDLISTS[language].indexOf(word);
            wordIndexes.push(wordIndex);
        }
        var wordIndexesStr = wordIndexes.join(", ");
        DOM.entropyWordIndexes.text(wordIndexesStr);
    }

    function showChecksum() {
        var phrase = DOM.phrase.val();
        var words = phraseToWordArray(phrase);
        var checksumBitlength = words.length / 3;
        var checksum = "";
        var binaryStr = "";
        var language = getLanguage();
        for (var i=words.length-1; i>=0; i--) {
            var word = words[i];
            var wordIndex = WORDLISTS[language].indexOf(word);
            var wordBinary = wordIndex.toString(2);
            while (wordBinary.length < 11) {
                wordBinary = "0" + wordBinary;
            }
            var binaryStr = wordBinary + binaryStr;
            if (binaryStr.length >= checksumBitlength) {
                var start = binaryStr.length - checksumBitlength;
                var end = binaryStr.length;
                checksum = binaryStr.substring(start, end);
                // add spaces so the last group is 11 bits, not the first
                checksum = checksum.split("").reverse().join("")
                checksum = addSpacesEveryElevenBits(checksum);
                checksum = checksum.split("").reverse().join("")
                break;
            }
        }
        DOM.entropyChecksum.text(checksum);
    }

    function updateCsv() {
        var tableCsv = "path,address,public key,private key\n";
        var rows = DOM.addresses.find("tr");
        for (var i=0; i<rows.length; i++) {
            var row = $(rows[i]);
            var cells = row.find("td");
            for (var j=0; j<cells.length; j++) {
                var cell = $(cells[j]);
                if (!cell.children().hasClass("invisible")) {
                    tableCsv = tableCsv + cell.text();
                }
                if (j != cells.length - 1) {
                    tableCsv = tableCsv + ",";
                }
            }
            tableCsv = tableCsv + "\n";
        }
        DOM.csv.val(tableCsv);
    }

    function addSpacesEveryElevenBits(binaryStr) {
        return binaryStr.match(/.{1,11}/g).join(" ");
    }

    var networks = [
        {
            name: "AC - Asiacoin",
            onSelect: function() {
                network = libs.bitcoin.networks.asiacoin;
                setHdCoin(51);
            },
        },
        {
            name: "ACC - Adcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.adcoin;
                setHdCoin(161);
            },
        },
        {
            name: "AGM - Argoneum",
            onSelect: function() {
                network = libs.bitcoin.networks.argoneum;
                setHdCoin(421);
            },
        },
        {
            name: "ARYA - Aryacoin",
            onSelect: function() {
                network = libs.bitcoin.networks.aryacoin;
                setHdCoin(357);
            },
        },
        {
            name: "ATOM - Cosmos Hub",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(118);
            },
        },
        {
            name: "AUR - Auroracoin",
            onSelect: function() {
                network = libs.bitcoin.networks.auroracoin;
                setHdCoin(85);
            },
        },
        {
            name: "AVAX - Avalanche",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(9000);
            },
        },
        {
            name: "AXE - Axe",
            onSelect: function() {
                network = libs.bitcoin.networks.axe;
                setHdCoin(4242);
            },
        },
        {
            name: "ANON - ANON",
            onSelect: function() {
                network = libs.bitcoin.networks.anon;
                setHdCoin(220);
            },
        },
        {
            name: "BOLI - Bolivarcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.bolivarcoin;
                setHdCoin(278);
            },
        },
        {
            name: "BCA - Bitcoin Atom",
            onSelect: function() {
                network = libs.bitcoin.networks.atom;
                setHdCoin(185);
            },
        },
        {
            name: "BCH - Bitcoin Cash",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                DOM.bitcoinCashAddressTypeContainer.removeClass("hidden");
                setHdCoin(145);
            },
        },
        {
            name: "BEET - Beetlecoin",
            onSelect: function() {
                network = libs.bitcoin.networks.beetlecoin;
                setHdCoin(800);
            },
        },
        {
            name: "BELA - Belacoin",
            onSelect: function() {
                network = libs.bitcoin.networks.belacoin;
                setHdCoin(73);
            },
        },
        {
            name: "BLK - BlackCoin",
            onSelect: function() {
                network = libs.bitcoin.networks.blackcoin;
                setHdCoin(10);
            },
        },
        {
            name: "BND - Blocknode",
            onSelect: function() {
                network = libs.bitcoin.networks.blocknode;
                setHdCoin(2941);
            },
        },
        {
            name: "tBND - Blocknode Testnet",
            onSelect: function() {
                network = libs.bitcoin.networks.blocknode_testnet;
                setHdCoin(1);
            },
        },
        {
            name: "BRIT - Britcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.britcoin;
                setHdCoin(70);
            },
        },
        {
            name: "BSD - Bitsend",
            onSelect: function() {
                network = libs.bitcoin.networks.bitsend;
                setHdCoin(91);
            },
        },
        {
            name: "BST - BlockStamp",
            onSelect: function() {
                network = libs.bitcoin.networks.blockstamp;
                setHdCoin(254);
            },
        },
        {
            name: "BTA - Bata",
            onSelect: function() {
                network = libs.bitcoin.networks.bata;
                setHdCoin(89);
            },
        },
        {
            name: "BTC - Bitcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(0);
            },
        },
        {
            name: "BTC - Bitcoin RegTest",
            onSelect: function() {
                network = libs.bitcoin.networks.regtest;
                // Using hd coin value 1 based on bip44_coin_type
                // https://github.com/chaintope/bitcoinrb/blob/f1014406f6b8f9b4edcecedc18df70c80df06f11/lib/bitcoin/chainparams/regtest.yml
                setHdCoin(1);
            },
        },
        {
            name: "BTC - Bitcoin Testnet",
            onSelect: function() {
                network = libs.bitcoin.networks.testnet;
                setHdCoin(1);
            },
        },
        {
            name: "BITG - Bitcoin Green",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoingreen;
                setHdCoin(222);
            },
        },
        {
            name: "BTCP - Bitcoin Private",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoinprivate;
                setHdCoin(183);
            },
        },
        {
            name: "BTCPt - Bitcoin Private Testnet",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoinprivatetestnet;
                setHdCoin(1);
            },
        },
        {
            name: "BSC - Binance Smart Chain",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(60);
            },
        },
        {
            name: "BSV - BitcoinSV",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoinsv;
                setHdCoin(236);
            },
        },
        {
            name: "BTCZ - Bitcoinz",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoinz;
                setHdCoin(177);
            },
        },
        {
            name: "BTDX - BitCloud",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcloud;
                setHdCoin(218);
            },
        },
        {
            name: "BTG - Bitcoin Gold",
            onSelect: function() {
                network = libs.bitcoin.networks.bgold;
                setHdCoin(156);
            },
        },
        {
            name: "BTX - Bitcore",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcore;
                setHdCoin(160);
            },
        },
        {
            name: "CCN - Cannacoin",
            onSelect: function() {
                network = libs.bitcoin.networks.cannacoin;
                setHdCoin(19);
            },
        },
        {
            name: "CESC - Cryptoescudo",
            onSelect: function() {
                network = libs.bitcoin.networks.cannacoin;
                setHdCoin(111);
            },
        },
        {
            name: "CDN - Canadaecoin",
            onSelect: function() {
                network = libs.bitcoin.networks.canadaecoin;
                setHdCoin(34);
            },
        },
        {
            name: "CLAM - Clams",
            onSelect: function() {
                network = libs.bitcoin.networks.clam;
                setHdCoin(23);
            },
        },
        {
            name: "CLO - Callisto",
            segwitAvailable: false,
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(820);
            },
        },
        {
            name: "CLUB - Clubcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.clubcoin;
                setHdCoin(79);
            },
        },
        {
            name: "CMP - Compcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.compcoin;
                setHdCoin(71);
            },
        },
        {
            name: "CPU - CPUchain",
            onSelect: function() {
                network = libs.bitcoin.networks.cpuchain;
                setHdCoin(363);
            },
        },
        {
            name: "CRAVE - Crave",
            onSelect: function() {
                network = libs.bitcoin.networks.crave;
                setHdCoin(186);
            },
        },
        {
            name: "CRP - CranePay",
            onSelect: function() {
                network = libs.bitcoin.networks.cranepay;
                setHdCoin(2304);
            },
        },

        {
            name: "CRW - Crown (Legacy)",
            onSelect: function() {
                network = libs.bitcoin.networks.crown;
                setHdCoin(72);
            },
        },
        {
            name: "CRW - Crown",
            onSelect: function() {
                network = libs.bitcoin.networks.crown;
                setHdCoin(72);
            },
        },
        {
            name: "CSC - CasinoCoin",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(359);
            },
        },
        {
            name: "DASH - Dash",
            onSelect: function() {
                network = libs.bitcoin.networks.dash;
                setHdCoin(5);
            },
        },
        {
            name: "DASH - Dash Testnet",
            onSelect: function() {
                network = libs.bitcoin.networks.dashtn;
                setHdCoin(1);
            },
        },
        {
            name: "DFC - Defcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.defcoin;
                setHdCoin(1337);
            },
        },
        {
            name: "DGB - Digibyte",
            onSelect: function() {
                network = libs.bitcoin.networks.digibyte;
                setHdCoin(20);
            },
        },
        {
            name: "DGC - Digitalcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.digitalcoin;
                setHdCoin(18);
            },
        },
        {
            name: "DMD - Diamond",
            onSelect: function() {
                network = libs.bitcoin.networks.diamond;
                setHdCoin(152);
            },
        },
        {
            name: "DNR - Denarius",
            onSelect: function() {
                network = libs.bitcoin.networks.denarius;
                setHdCoin(116);
            },
        },
        {
            name: "DOGE - Dogecoin",
            onSelect: function() {
                network = libs.bitcoin.networks.dogecoin;
                setHdCoin(3);
            },
        },
        {
            name: "DOGEt - Dogecoin Testnet",
            onSelect: function() {
                network = libs.bitcoin.networks.dogecointestnet;
                setHdCoin(1);
            },
        },
        {
            name: "DXN - DEXON",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(237);
            },
        },
        {
            name: "ECN - Ecoin",
            onSelect: function() {
                network = libs.bitcoin.networks.ecoin;
                setHdCoin(115);
            },
        },
        {
            name: "EDRC - Edrcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.edrcoin;
                setHdCoin(56);
            },
        },
        {
            name: "EFL - Egulden",
            onSelect: function() {
                network = libs.bitcoin.networks.egulden;
                setHdCoin(78);
            },
        },
        {
            name: "ELA - Elastos",
            onSelect: function () {
                network = libs.bitcoin.networks.elastos;
                setHdCoin(2305);
            },
        },
        {
            name: "ELLA - Ellaism",
            segwitAvailable: false,
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(163);
            },
        },
        {
            name: "EMC2 - Einsteinium",
            onSelect: function() {
                network = libs.bitcoin.networks.einsteinium;
                setHdCoin(41);
            },
        },
        {
            name: "ERC - Europecoin",
            onSelect: function() {
                network = libs.bitcoin.networks.europecoin;
                setHdCoin(151);
            },
        },
        {
            name: "EOS - EOSIO",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(194);
            },
        },
        {
            name: "ERE - EtherCore",
            segwitAvailable: false,
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(466);
            },
        },
        {
            name: "ESN - Ethersocial Network",
            segwitAvailable: false,
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(31102);
            },
        },
        {
            name: "ETC - Ethereum Classic",
            segwitAvailable: false,
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(61);
            },
        },
        {
            name: "ETH - Ethereum (Execution Layer)",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(60);
            },
          },
        {
            name: "ETH - Ethereum (Consensus Layer)",
          },
        {
            name: "EWT - EnergyWeb",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(246);
            },
          },
        {
            name: "EXCL - Exclusivecoin",
            onSelect: function() {
                network = libs.bitcoin.networks.exclusivecoin;
                setHdCoin(190);
            },
        },
        {
            name: "EXCC - ExchangeCoin",
            onSelect: function() {
                network = libs.bitcoin.networks.exchangecoin;
                setHdCoin(0);
            },
        },
        {
            name: "EXP - Expanse",
            segwitAvailable: false,
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(40);
            },
        },
        {
            name: "FIO - Foundation for Interwallet Operability",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(235);
            },
        },
        {
            name: "FIRO - Firo (Zcoin rebrand)",
            onSelect: function() {
                network = libs.bitcoin.networks.firo;
                setHdCoin(136);
            },
        },
        {
            name: "FIX - FIX",
            onSelect: function() {
                network = libs.bitcoin.networks.fix;
                setHdCoin(336);
            },
        },
        {
            name: "FIX - FIX Testnet",
            onSelect: function() {
                network = libs.bitcoin.networks.fixtestnet;
                setHdCoin(1);
            },
        },
        {
            name: "FJC - Fujicoin",
            onSelect: function() {
                network = libs.bitcoin.networks.fujicoin;
                setHdCoin(75);
            },
        },
        {
            name: "FLASH - Flashcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.flashcoin;
                setHdCoin(120);
            },
        },
        {
            name: "FRST - Firstcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.firstcoin;
                setHdCoin(167);
            },
        },
        {
            name: "FTC - Feathercoin",
            onSelect: function() {
                network = libs.bitcoin.networks.feathercoin;
                setHdCoin(8);
            },
        },
        {
            name: "GAME - GameCredits",
            onSelect: function() {
                network = libs.bitcoin.networks.game;
                setHdCoin(101);
            },
        },
        {
            name: "GBX - Gobyte",
            onSelect: function() {
                network = libs.bitcoin.networks.gobyte;
                setHdCoin(176);
            },
        },
        {
            name: "GCR - GCRCoin",
            onSelect: function() {
                network = libs.bitcoin.networks.gcr;
                setHdCoin(79);
            },
        },
        {
            name: "GRC - Gridcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.gridcoin;
                setHdCoin(84);
            },
        },
        {
            name: "GRS - Groestlcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.groestlcoin;
                setHdCoin(17);
            },
        },
        {
            name: "GRS - Groestlcoin Testnet",
            onSelect: function() {
                network = libs.bitcoin.networks.groestlcointestnet;
                setHdCoin(1);
            },
        },
        {
            name: "HNS - Handshake",
            onSelect: function() {
                setHdCoin(5353);
            },
        },
        {
            name: "HNC - Helleniccoin",
            onSelect: function() {
                network = libs.bitcoin.networks.helleniccoin;
                setHdCoin(168);
            },
        },
        {
            name: "HUSH - Hush (Legacy)",
            onSelect: function() {
                network = libs.bitcoin.networks.hush;
                setHdCoin(197);
            },
        },
        {
            name: "HUSH - Hush3",
            onSelect: function() {
                network = libs.bitcoin.networks.hush3;
                setHdCoin(197);
            },
        },
        {
            name: "INSN - Insane",
            onSelect: function() {
                network = libs.bitcoin.networks.insane;
                setHdCoin(68);
            },
        },
        {
            name: "IOP - Iop",
            onSelect: function() {
                network = libs.bitcoin.networks.iop;
                setHdCoin(66);
            },
        },
        {
            name: "IOV - Starname",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(234);
            },
         },
         {
            name: "IXC - Ixcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.ixcoin;
                setHdCoin(86);
            },
        },
        {
            name: "JBS - Jumbucks",
            onSelect: function() {
                network = libs.bitcoin.networks.jumbucks;
                setHdCoin(26);
            },
        },
        {
            name: "KMD - Komodo",
            bip49available: false,
            onSelect: function() {
                network = libs.bitcoin.networks.komodo;
                setHdCoin(141);
            },
        },
        {
            name: "KOBO - Kobocoin",
            bip49available: false,
            onSelect: function() {
                network = libs.bitcoin.networks.kobocoin;
                setHdCoin(196);
            },
        },
        {
            name: "LBC - Library Credits",
            onSelect: function() {
                network = libs.bitcoin.networks.lbry;
                setHdCoin(140);
            },
        },
        {
            name: "LCC - Litecoincash",
            onSelect: function() {
                network = libs.bitcoin.networks.litecoincash;
                setHdCoin(192);
            },
        },
        {
            name: "LDCN - Landcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.landcoin;
                setHdCoin(63);
            },
        },
        {
            name: "LINX - Linx",
            onSelect: function() {
                network = libs.bitcoin.networks.linx;
                setHdCoin(114);
            },
        },
        {
            name: "LKR - Lkrcoin",
            segwitAvailable: false,
            onSelect: function() {
                network = libs.bitcoin.networks.lkrcoin;
                setHdCoin(557);
            },
        },
        {
            name: "LTC - Litecoin",
            onSelect: function() {
                network = libs.bitcoin.networks.litecoin;
                setHdCoin(2);
                DOM.litecoinLtubContainer.removeClass("hidden");
            },
        },
        {
            name: "LTCt - Litecoin Testnet",
            onSelect: function() {
                network = libs.bitcoin.networks.litecointestnet;
                setHdCoin(1);
                DOM.litecoinLtubContainer.removeClass("hidden");
            },
        },
        {
            name: "LTZ - LitecoinZ",
            onSelect: function() {
                network = libs.bitcoin.networks.litecoinz;
                setHdCoin(221);
            },
        },
        {
            name: "LUNA - Terra",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(330);
            },
        },
        {
            name: "LYNX - Lynx",
            onSelect: function() {
                network = libs.bitcoin.networks.lynx;
                setHdCoin(191);
            },
        },
        {
            name: "MAZA - Maza",
            onSelect: function() {
                network = libs.bitcoin.networks.maza;
                setHdCoin(13);
            },
        },
        {
            name: "MEC - Megacoin",
            onSelect: function() {
                network = libs.bitcoin.networks.megacoin;
                setHdCoin(217);
            },
        },
        {
            name: "MIX - MIX",
            segwitAvailable: false,
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(76);
            },
        },
        {
            name: "MNX - Minexcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.minexcoin;
                setHdCoin(182);
            },
        },
        {
            name: "MONA - Monacoin",
            onSelect: function() {
                network = libs.bitcoin.networks.monacoin,
                setHdCoin(22);
            },
        },
        {
            name: "MONK - Monkey Project",
            onSelect: function() {
                network = libs.bitcoin.networks.monkeyproject,
                setHdCoin(214);
            },
        },
        {
            name: "MOAC - MOAC",
            segwitAvailable: false,
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(314);
            },
        },
        {
            name: "MUSIC - Musicoin",
            segwitAvailable: false,
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(184);
            },
        },
        {
            name: "NANO - Nano",
            onSelect: function() {
                network = network = libs.nanoUtil.dummyNetwork;
                setHdCoin(165);
            },
        },
        {
            name: "NAV - Navcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.navcoin;
                setHdCoin(130);
            },
        },
        {
            name: "NAS - Nebulas",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(2718);
            },
        },
        {
            name: "NEBL - Neblio",
            onSelect: function() {
                network = libs.bitcoin.networks.neblio;
                setHdCoin(146);
            },
        },
        {
            name: "NEOS - Neoscoin",
            onSelect: function() {
                network = libs.bitcoin.networks.neoscoin;
                setHdCoin(25);
            },
        },
        {
            name: "NIX - NIX Platform",
            onSelect: function() {
                network = libs.bitcoin.networks.nix;
                setHdCoin(400);
            },
        },
        {
            name: "NLG - Gulden",
            onSelect: function() {
                network = libs.bitcoin.networks.gulden;
                setHdCoin(87);
            },
        },
        {
            name: "NMC - Namecoin",
            onSelect: function() {
                network = libs.bitcoin.networks.namecoin;
                setHdCoin(7);
            },
        },
        {
            name: "NRG - Energi",
            onSelect: function() {
                network = libs.bitcoin.networks.energi;
                setHdCoin(204);
            },
        },
        {
            name: "NRO - Neurocoin",
            onSelect: function() {
                network = libs.bitcoin.networks.neurocoin;
                setHdCoin(110);
            },
        },
        {
            name: "NSR - Nushares",
            onSelect: function() {
                network = libs.bitcoin.networks.nushares;
                setHdCoin(11);
            },
        },
        {
            name: "NYC - Newyorkc",
            onSelect: function() {
                network = libs.bitcoin.networks.newyorkc;
                setHdCoin(179);
            },
        },
        {
            name: "NVC - Novacoin",
            onSelect: function() {
                network = libs.bitcoin.networks.novacoin;
                setHdCoin(50);
            },
        },
        {
            name: "OK - Okcash",
            onSelect: function() {
                network = libs.bitcoin.networks.okcash;
                setHdCoin(69);
            },
        },
        {
            name: "OMNI - Omnicore",
            onSelect: function() {
                network = libs.bitcoin.networks.omnicore;
                setHdCoin(200);
            },
        },
        {
            name: "ONION - DeepOnion",
            onSelect: function() {
                network = libs.bitcoin.networks.deeponion;
                setHdCoin(305);
            },
        },
        {
            name: "ONX - Onixcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.onixcoin;
                setHdCoin(174);
            },
        },
        {
            name: "PHR - Phore",
            onSelect: function() {
                network = libs.bitcoin.networks.phore;
                setHdCoin(444);
            },
        },
        {
            name: "PINK - Pinkcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.pinkcoin;
                setHdCoin(117);
            },
        },
        {
            name: "PIRL - Pirl",
            segwitAvailable: false,
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(164);
            },
        },
        {
            name: "PIVX - PIVX",
            onSelect: function() {
                network = libs.bitcoin.networks.pivx;
                setHdCoin(119);
            },
        },
        {
            name: "PIVX - PIVX Testnet",
            onSelect: function() {
                network = libs.bitcoin.networks.pivxtestnet;
                setHdCoin(1);
            },
        },
        {
            name: "POA - Poa",
            segwitAvailable: false,
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(178);
            },
        },
        {
            name: "POSW - POSWcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.poswcoin;
                setHdCoin(47);
            },
        },
        {
            name: "POT - Potcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.potcoin;
                setHdCoin(81);
            },
        },
        {
            name: "PPC - Peercoin",
            onSelect: function() {
                network = libs.bitcoin.networks.peercoin;
                setHdCoin(6);
            },
        },
        {
            name: "PRJ - ProjectCoin",
            onSelect: function() {
                network = libs.bitcoin.networks.projectcoin;
                setHdCoin(533);
            },
        },
        {
            name: "PSB - Pesobit",
            onSelect: function() {
                network = libs.bitcoin.networks.pesobit;
                setHdCoin(62);
            },
        },
        {
            name: "PUT - Putincoin",
            onSelect: function() {
                network = libs.bitcoin.networks.putincoin;
                setHdCoin(122);
            },
        },
        {
            name: "RPD - Rapids",
            onSelect: function() {
                network = libs.bitcoin.networks.rapids;
                setHdCoin(320);
            },
        },
        {
            name: "RVN - Ravencoin",
            onSelect: function() {
                network = libs.bitcoin.networks.ravencoin;
                setHdCoin(175);
            },
        },
        {
            name: "R-BTC - RSK",
            onSelect: function() {
                network = libs.bitcoin.networks.rsk;
                setHdCoin(137);
            },
        },
        {
            name: "tR-BTC - RSK Testnet",
            onSelect: function() {
                network = libs.bitcoin.networks.rsktestnet;
                setHdCoin(37310);
            },
        },
        {
            name: "RBY - Rubycoin",
            onSelect: function() {
                network = libs.bitcoin.networks.rubycoin;
                setHdCoin(16);
            },
        },
        {
            name: "RDD - Reddcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.reddcoin;
                setHdCoin(4);
            },
        },
        {
            name: "RITO - Ritocoin",
            onSelect: function() {
                network = libs.bitcoin.networks.ritocoin;
                setHdCoin(19169);
            },
        },
        {
            name: "RUNE - THORChain",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(931);
            },
        },
        {
            name: "RVR - RevolutionVR",
            onSelect: function() {
                network = libs.bitcoin.networks.revolutionvr;
                setHdCoin(129);
            },
        },
        {
          name: "SAFE - Safecoin",
          onSelect: function() {
              network = libs.bitcoin.networks.safecoin;
              setHdCoin(19165);
            },
        },
        {
            name: "SCRIBE - Scribe",
            onSelect: function() {
                network = libs.bitcoin.networks.scribe;
                setHdCoin(545);
            },
        },
    {
          name: "SLS - Salus",
          onSelect: function() {
              network = libs.bitcoin.networks.salus;
              setHdCoin(63);
            },
        },
        {
            name: "SDC - ShadowCash",
            onSelect: function() {
                network = libs.bitcoin.networks.shadow;
                setHdCoin(35);
            },
        },
        {
            name: "SDC - ShadowCash Testnet",
            onSelect: function() {
                network = libs.bitcoin.networks.shadowtn;
                setHdCoin(1);
            },
        },
        {
            name: "SLM - Slimcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.slimcoin;
                setHdCoin(63);
            },
        },
        {
            name: "SLM - Slimcoin Testnet",
            onSelect: function() {
                network = libs.bitcoin.networks.slimcointn;
                setHdCoin(111);
            },
        },
        {
            name: "SLP - Simple Ledger Protocol",
            onSelect: function() {
                DOM.bitcoinCashAddressTypeContainer.removeClass("hidden");
                setHdCoin(245);
            },
        },
        {
            name: "SLR - Solarcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.solarcoin;
                setHdCoin(58);
            },
        },
        {
            name: "SMLY - Smileycoin",
            onSelect: function() {
                network = libs.bitcoin.networks.smileycoin;
                setHdCoin(59);
            },
        },
        {
            name: "STASH - Stash",
            onSelect: function() {
                network = libs.bitcoin.networks.stash;
                setHdCoin(0xC0C0);
            },
        },
        {
            name: "STASH - Stash Testnet",
            onSelect: function() {
                network = libs.bitcoin.networks.stashtn;
                setHdCoin(0xCAFE);
            },
        },
        {
            name: "STRAT - Stratis",
            onSelect: function() {
                network = libs.bitcoin.networks.stratis;
                setHdCoin(105);
            },
        },
        {
            name: "SUGAR - Sugarchain",
            onSelect: function() {
                network = libs.bitcoin.networks.sugarchain;
                setHdCoin(408);
            },
        },
        {
            name: "TUGAR - Sugarchain Testnet",
            onSelect: function() {
                network = libs.bitcoin.networks.sugarchaintestnet;
                setHdCoin(408);
            },
        },
        {
            name: "SWTC - Jingtum",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(315);
            },
        },
        {
            name: "TSTRAT - Stratis Testnet",
            onSelect: function() {
                network = libs.bitcoin.networks.stratistest;
                setHdCoin(105);
            },
        },
        {
            name: "SYS - Syscoin",
            onSelect: function() {
                network = libs.bitcoin.networks.syscoin;
                setHdCoin(57);
            },
        },
        {
            name: "THC - Hempcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.hempcoin;
                setHdCoin(113);
            },
        },
        {
            name: "THT - Thought",
            onSelect: function() {
                network = libs.bitcoin.networks.thought;
                setHdCoin(1618);
            },
        },
        {
            name: "TOA - Toa",
            onSelect: function() {
                network = libs.bitcoin.networks.toa;
                setHdCoin(159);
            },
        },
        {
            name: "TRX - Tron",
            onSelect: function() {
                setHdCoin(195);
            },
        },
        {
            name: "TWINS - TWINS",
            onSelect: function() {
                network = libs.bitcoin.networks.twins;
                setHdCoin(970);
            },
        },
        {
            name: "TWINS - TWINS Testnet",
            onSelect: function() {
                network = libs.bitcoin.networks.twinstestnet;
                setHdCoin(1);
            },
        },
        {
            name: "USC - Ultimatesecurecash",
            onSelect: function() {
                network = libs.bitcoin.networks.ultimatesecurecash;
                setHdCoin(112);
            },
        },
        {
            name: "USNBT - NuBits",
            onSelect: function() {
                network = libs.bitcoin.networks.nubits;
                setHdCoin(12);
            },
        },
        {
            name: "UNO - Unobtanium",
            onSelect: function() {
                network = libs.bitcoin.networks.unobtanium;
                setHdCoin(92);
            },
        },
        {
            name: "VASH - Vpncoin",
            onSelect: function() {
                network = libs.bitcoin.networks.vpncoin;
                setHdCoin(33);
            },
        },
        {
            name: "VET - VeChain",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(818);
            },
        },
        {
            name: "VIA - Viacoin",
            onSelect: function() {
                network = libs.bitcoin.networks.viacoin;
                setHdCoin(14);
            },
        },
        {
            name: "VIA - Viacoin Testnet",
            onSelect: function() {
                network = libs.bitcoin.networks.viacointestnet;
                setHdCoin(1);
            },
        },
        {
            name: "VIVO - Vivo",
            onSelect: function() {
                network = libs.bitcoin.networks.vivo;
                setHdCoin(166);
            },
        },
        {
            name: "VTC - Vertcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.vertcoin;
                setHdCoin(28);
            },
        },
        {
            name: "WGR - Wagerr",
            onSelect: function() {
                network = libs.bitcoin.networks.wagerr;
                setHdCoin(7825266);
            },
        },
        {
            name: "WC - Wincoin",
            onSelect: function() {
                network = libs.bitcoin.networks.wincoin;
                setHdCoin(181);
            },
        },
        {
            name: "XAX - Artax",
            onSelect: function() {
                network = libs.bitcoin.networks.artax;
                setHdCoin(219);
            },
        },
        {
            name: "XBC - Bitcoinplus",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoinplus;
                setHdCoin(65);
            },
        },
        {
            name: "XLM - Stellar",
            onSelect: function() {
                network = libs.stellarUtil.dummyNetwork;
                setHdCoin(148);
            },
        },
        {
            name: "XMY - Myriadcoin",
            onSelect: function() {
                network = libs.bitcoin.networks.myriadcoin;
                setHdCoin(90);
            },
        },
        {
            name: "XRP - Ripple",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(144);
            },
        },
        {
            name: "XVC - Vcash",
            onSelect: function() {
                network = libs.bitcoin.networks.vcash;
                setHdCoin(127);
            },
        },
        {
            name: "XVG - Verge",
            onSelect: function() {
                network = libs.bitcoin.networks.verge;
                setHdCoin(77);
            },
        },
        {
            name: "XUEZ - Xuez",
            segwitAvailable: false,
            onSelect: function() {
                network = libs.bitcoin.networks.xuez;
                setHdCoin(225);
            },
        },
        {
            name: "XWCC - Whitecoin Classic",
            onSelect: function() {
                network = libs.bitcoin.networks.whitecoin;
                setHdCoin(155);
            },
        },
        {
            name: "XZC - Zcoin (rebranded to Firo)",
            onSelect: function() {
                network = libs.bitcoin.networks.zcoin;
                setHdCoin(136);
            },
        },
        {
            name: "ZBC - ZooBlockchain",
            onSelect: function () {
            network = libs.bitcoin.networks.zoobc;
            setHdCoin(883);
            },
        },
        {
            name: "ZCL - Zclassic",
            onSelect: function() {
                network = libs.bitcoin.networks.zclassic;
                setHdCoin(147);
            },
        },
        {
            name: "ZEC - Zcash",
            onSelect: function() {
                network = libs.bitcoin.networks.zcash;
                setHdCoin(133);
            },
        },
        {
            name: "ZEN - Horizen",
            onSelect: function() {
                network = libs.bitcoin.networks.zencash;
                setHdCoin(121);
            },
        },
        {
            name: "XWC - Whitecoin",
            onSelect: function() {
                network = libs.bitcoin.networks.bitcoin;
                setHdCoin(559);
            },
        }
    ]

    var clients = [
        {
            name: "Bitcoin Core",
            onSelect: function() {
                DOM.bip32path.val("m/0'/0'");
                DOM.hardenedAddresses.prop('checked', true);
            },
        },
        {
            name: "blockchain.info",
            onSelect: function() {
                DOM.bip32path.val("m/44'/0'/0'");
                DOM.hardenedAddresses.prop('checked', false);
            },
        },
        {
            name: "MultiBit HD",
            onSelect: function() {
                DOM.bip32path.val("m/0'/0");
                DOM.hardenedAddresses.prop('checked', false);
            },
        },
        {
            name: "Coinomi, Ledger",
            onSelect: function() {
                DOM.bip32path.val("m/44'/"+DOM.bip44coin.val()+"'/0'");
                DOM.hardenedAddresses.prop('checked', false);
            },
        }
    ]

    // RSK - RSK functions - begin
    function stripHexPrefix(address) {
        if (typeof address !== "string") {
            throw new Error("address parameter should be a string.");
        }

        var hasPrefix = (address.substring(0, 2) === "0x" ||
            address.substring(0, 2) === "0X");

        return hasPrefix ? address.slice(2) : address;
    };

    function toChecksumAddressForRsk(address, chainId = null) {
        if (typeof address !== "string") {
            throw new Error("address parameter should be a string.");
        }

        if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
            throw new Error("Given address is not a valid RSK address: " + address);
        }

        var stripAddress = stripHexPrefix(address).toLowerCase();
        var prefix = chainId != null ? chainId.toString() + "0x" : "";
        var keccakHash = libs.ethUtil.keccak256(prefix + stripAddress)
            .toString("hex")
            .replace(/^0x/i, "");
        var checksumAddress = "0x";

        for (var i = 0; i < stripAddress.length; i++) {
            checksumAddress +=
                parseInt(keccakHash[i], 16) >= 8 ?
                stripAddress[i].toUpperCase() :
                stripAddress[i];
        }

        return checksumAddress;
    }

    // RSK - RSK functions - end

    // ELA - Elastos functions - begin
    function displayBip44InfoForELA() {
        if (!isELA()) {
            return;
        }

        var coin = parseIntNoNaN(DOM.bip44coin.val(), 0);
        var account = parseIntNoNaN(DOM.bip44account.val(), 0);

        // Calculate the account extended keys
        var accountXprv = libs.elastosjs.getAccountExtendedPrivateKey(seed, coin, account);
        var accountXpub = libs.elastosjs.getAccountExtendedPublicKey(seed, coin, account);

        // Display the extended keys
        DOM.bip44accountXprv.val(accountXprv);
        DOM.bip44accountXpub.val(accountXpub);
    }

    function displayBip32InfoForELA() {
        if (!isELA()) {
            return;
        }

        var coin = parseIntNoNaN(DOM.bip44coin.val(), 0);
        var account = parseIntNoNaN(DOM.bip44account.val(), 0);
        var change = parseIntNoNaN(DOM.bip44change.val(), 0);

        DOM.extendedPrivKey.val(libs.elastosjs.getBip32ExtendedPrivateKey(seed, coin, account, change));
        DOM.extendedPubKey.val(libs.elastosjs.getBip32ExtendedPublicKey(seed, coin, account, change));

        // Display the addresses and privkeys
        clearAddressesList();
        var initialAddressCount = parseInt(DOM.rowsToAdd.val());
        displayAddresses(0, initialAddressCount);
    }

    function calcAddressForELA(seed, coin, account, change, index) {
        if (!isELA()) {
            return;
        }

        var publicKey = libs.elastosjs.getDerivedPublicKey(libs.elastosjs.getMasterPublicKey(seed), change, index);
        return {
            privateKey: libs.elastosjs.getDerivedPrivateKey(seed, coin, account, change, index),
            publicKey: publicKey,
            address: libs.elastosjs.getAddress(publicKey.toString('hex'))
        };
    }
    // ELA - Elastos functions - end

    // Start of EIP2333 section

    var eip2333SelectPath = [
        {
            name: "Withdrawal keys",
            onSelect: function() {
                DOM.eip2333Path.val("m/12381/3600/i/0");
            },
        },
        {
            name: "Signing keys",
            onSelect: function() {
                DOM.eip2333Path.val("m/12381/3600/i/0/0");
            },
        },
    ]

    function populateEip2333SelectPath() {
        for (var i=0; i<eip2333SelectPath.length; i++) {
            var path = eip2333SelectPath[i];
            var option = $("<option>");
            option.attr("value", i);
            option.text(path.name);
            DOM.eip2333SelectPath.append(option);
        }
    }

    function eip2333SelectPathChanged(e) {
        var pathIndex = DOM.eip2333SelectPath.val();
        if (pathIndex == "custom") {
            DOM.eip2333Path.prop("readonly", false);
        }
        else {
            DOM.eip2333Path.prop("readonly", true);
            eip2333SelectPath[pathIndex].onSelect();
        }
        eip2333addresses();
    }

    function processMnemonic() {
        calculateEip2333MasterKeys();
        eip2333addresses();
    }

    function calculateEip2333MasterKeys() {
      var seed = hexToBytes(source().seed);
      var masterSecretKey = eip2333.blskeygen.deriveMaster(seed);
      var masterPublicKey = eip2333.noblebls.getPublicKey(masterSecretKey);
      if (DOM.useBip85.prop("checked")) {
          DOM.masterSecretKeyBip85.val(bytesToHex(masterSecretKey).padStart(64, "0"));
          DOM.masterPublicKeyBip85.val(bytesToHex(masterPublicKey).padStart(96, "0"));
      }
      else {
          DOM.masterSecretKey.val(bytesToHex(masterSecretKey).padStart(64, "0"));
          DOM.masterPublicKey.val(bytesToHex(masterPublicKey).padStart(96, "0"));
      }
    }

    function masterSecretKeyChanged() {
      // warn user before erasing any existing data
        if (DOM.seed.val().length > 0) {
            if (!confirm("This will erase any existing mnemonic, passphrase, seed and BIP32 rootkey. Continue?")) {
                calculateEip2333MasterKeys(); // revert master secret key from previous seed
                return;
            }
            DOM.phrase.val("");
            DOM.phraseSplit.val("");
            DOM.passphrase.val("");
            DOM.seed.val("");
            DOM.rootKey.val("");
            DOM.bip85Field.val('');
            seed = null;
          }
          var masterSecretKey = hexToBytes(DOM.masterSecretKey.val());
          var masterPublicKey = eip2333.noblebls.getPublicKey(masterSecretKey);
          DOM.masterPublicKey.val(bytesToHex(masterPublicKey).padStart(96, "0"));
          eip2333addresses();
    }

    function hexToBytes(hex) {
        let bytes = new Uint8Array(hex.length/2);
        for (let c = 0; c < hex.length; c += 2)
            bytes[c/2] = parseInt(hex.substr(c, 2), 16);
        return bytes;
    }

    function bytesToHex(bytes) {
        for (var hex = [], i = 0; i < bytes.length; i++) {
            var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
            hex.push((current >>> 4).toString(16));
            hex.push((current & 0xF).toString(16));
        }
        return hex.join("");
    }

    function eip2333addresses() {
        clearAddressesList();
        var currentTableIndex = -1;
        let rowsToAdd = parseInt(DOM.rowsToAdd.val());
        let startIndex = parseInt(DOM.moreRowsStartIndex.val()) || currentTableIndex + 1;
        displayAddresses(startIndex, rowsToAdd);
    }

    function showRows(startIndex, rowsToAdd) {
        showPending();
        var masterSecretKey = source().masterSecretKey;

        // Warnings if Master Secret Key is derived from empty seed or if seed is not at least 256 bit.
        if (bytesToHex(masterSecretKey) == "4c67e3512877eb063003bea7429ac36ce032b74f5afe83b202e2bdc3298feee1") {
          if (!confirm("Master Secret Key looks suspicious! Probably derived from invalid seed! Continue?")) {
            showValidationError("Master Secret Key is suspicious! Probably derived from invalid seed!");
          return
          }
          DOM.eip2333Keys.addClass("bg-danger");
        }
        if (source().seed.length < 64) {
          if (!confirm("You should use Seed (at least 256 bit) to derive Master Secret Key. Continue?")) {
              return
          }
          DOM.eip2333Keys.addClass("bg-danger");
        }

        let path = DOM.eip2333Path.val();
        for (let i=startIndex; i<startIndex+rowsToAdd; i++) {
            let childPath = path.replace(/i/g, i);
            let childIndices = getIndices(childPath);
            let childSk = masterSecretKey;
            for (let i=0; i<childIndices.length; i++) {
                let childIndice = childIndices[i];
                try {
                    childSk = eip2333.blskeygen.deriveChild(childSk, childIndice);
                }
                catch (e) {
                    // TODO show error?
                    return;
                }
            }
            let childPk = eip2333.noblebls.getPublicKey(childSk);

            // show in table
            let childSkHex = bytesToHex(childSk).padStart(64, "0");
            let childPkHex = bytesToHex(childPk).padStart(96, "0");
            addAddressToList(childPath, "", childPkHex, childSkHex);
        }
        hidePending();
    }

    function getIndices(path) {
        let indices = [];
        let bits = path.split("/");
        for (let i=0; i<bits.length; i++) {
            let indice = parseInt(bits[i]);
            if (!(isNaN(indice))) {
                indices.push(indice);
            }
        }
        return indices;
    }
    // End of EIP2333 section


    function download(data, filename, type) {
        var file = new Blob([data], {type: type});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"),
                    url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    function downloadImage(data, filename = 'untitled.jpeg') {
        var a = document.createElement('a');
        a.href = data;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
    }

    function downloadShamir() {
        var data = DOM.splitParts.val();
        var filename = "shamir39parts";
        var type = "txt";
        download(data, filename, type);
        downloadShamirQR();
    }

    function downloadShamirQR() {
        var partsStr = DOM.splitParts.val();
        var partsDirty = partsStr.split("\n");
        var j = 0;
        for (var i=0; i<partsDirty.length; i++) {
            var part = partsDirty[i];
            part = part.trim();
            if (part.length > 0) {
                ++j;
                var qrPart = libs.kjua({
                    text: part,
                    render: "canvas",
                    size: 350,
                    ecLevel: "H",
                    version: 40,
                });
                var dataURL = qrPart.toDataURL("image/jpeg", 1.0);
                downloadImage(dataURL, 'shamirQR-part-'+j+'.jpeg');
            }
        }
    }

    function downloadRSAkey(x,y) {
        var data = y;
        var filename = x;
        var type = "pub";
        download(data, filename, type);
    }

    function downloadCSV() {
        var data = DOM.csv.val();
        var filename = "Addresses.csv";
        var type = "txt";
        download(data, filename, type);
    }

    function playByteArray(clip) {
        context = new AudioContext();
        var bytes = clip;
        var buffer = new Uint8Array(bytes.length);
        buffer.set(new Uint8Array(bytes), 0);

        context.decodeAudioData(buffer.buffer, play);
    }

    function play(audioBuffer) {
        var source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination);
        source.start(0);
    }

    function onScanSuccess(decodedText, decodedResult) {
        if (decodedText !== lastResult)  {
            ++countResults;
            lastResult = decodedText;
            current = DOM.combineParts.val();
            var show = (decodedText + "\n" + current);
            DOM.combineParts.val(show);
            if (countResults%4 == 1){
              playByteArray(dspf1);
            } else if (countResults%4 == 2){
              playByteArray(dspf2);
            } else if (countResults%4 == 3){
              playByteArray(dspf3);
            } else if (countResults%4 == 0){
              playByteArray(dspf4);
            }
            setTimeout(function() {
              showCombinedPhrase(show);
            }, 10);
        } else {
            showQrError("Already registered. Scan next part!");
        }
    }

    function showQrError(errorText) {
        DOM.qrError
        .text(errorText)
        .show();
    }

    function toggleQrScan() {
        hideValidationError();
        scanQr = !scanQr;
        if (scanQr) {
            html5QrcodeScanner.render(onScanSuccess);
        }
        else {
            html5QrcodeScanner.clear();
            DOM.qrError.hide();
            DOM.qrScanContainer.modal("hide");
        }
    }
    //Dance Of The Sugar Plum Fairy - first half of the first bar (from https://commons.wikimedia.org/wiki/File:Dance_of_the_Sugar_Plum_Fairies_(ISRC_USUAN1100270).oga)
    var dspf1 = [79,103,103,83,0,2,0,0,0,0,0,0,0,0,26,38,0,0,0,0,0,0,16,107,201,245,1,30,1,118,111,114,98,105,115,0,0,0,0,2,68,172,0,0,0,0,0,0,0,250,0,0,0,0,0,0,184,1,79,103,103,83,0,0,0,0,0,0,0,0,0,0,26,38,0,0,1,0,0,0,130,187,250,18,16,59,255,255,255,255,255,255,255,255,255,255,255,255,255,255,193,3,118,111,114,98,105,115,43,0,0,0,88,105,112,104,46,79,114,103,32,108,105,98,86,111,114,98,105,115,32,73,32,50,48,49,50,48,50,48,51,32,40,79,109,110,105,112,114,101,115,101,110,116,41,0,0,0,0,1,5,118,111,114,98,105,115,33,66,67,86,1,0,0,1,0,24,99,84,41,70,153,82,210,74,137,25,115,148,49,70,153,98,146,74,137,165,132,22,66,72,157,115,20,83,169,57,215,156,107,172,185,181,32,132,16,26,83,80,41,5,153,82,142,82,105,25,99,144,41,5,153,82,16,75,73,37,116,18,58,39,157,99,16,91,73,193,214,152,107,139,65,182,28,132,13,154,82,76,41,196,148,82,138,66,8,25,83,140,41,197,148,82,74,66,7,37,116,14,58,230,28,83,142,74,40,65,184,156,115,171,181,150,150,99,139,169,116,146,74,231,36,100,76,66,72,41,133,146,74,7,165,83,78,66,72,53,150,214,82,41,29,115,82,82,106,65,232,32,132,16,66,182,32,132,13,130,208,144,85,0,0,1,0,192,64,16,26,178,10,0,80,0,0,16,138,161,24,138,2,132,134,172,2,0,50,0,0,4,160,40,142,226,40,142,35,57,146,99,73,22,16,26,178,10,0,0,2,0,16,0,0,192,112,20,73,145,20,201,177,36,75,210,44,75,211,68,81,85,125,213,54,85,85,246,117,93,215,117,93,215,117,32,52,100,21,0,0,1,0,64,72,167,153,165,26,32,194,12,100,24,8,13,89,5,0,32,0,0,0,70,40,194,16,3,66,67,86,1,0,0,1,0,0,98,40,57,136,38,180,230,124,115,142,131,102,57,104,42,197,230,116,112,34,213,230,73,110,42,230,230,156,115,206,57,39,155,115,198,56,231,156,115,138,114,102,49,104,38,180,230,156,115,18,131,102,41,104,38,180,230,156,115,158,196,230,65,107,170,180,230,156,115,198,57,167,131,113,70,24,231,156,115,154,180,230,65,106,54,214,230,156,115,22,180,166,57,106,46,197,230,156,115,34,229,230,73,109,46,213,230,156,115,206,57,231,156,115,206,57,231,156,115,170,23,167,115,112,78,56,231,156,115,162,246,230,90,110,66,23,231,156,115,62,25,167,123,115,66,56,231,156,115,206,57,231,156,115,206,57,231,156,115,130,208,144,85,0,0,16,0,0,65,24,54,134,113,167,32,72,159,163,129,24,69,136,105,200,164,7,221,163,195,36,104,12,114,10,169,71,163,163,145,82,234,32,148,84,198,73,41,157,32,52,100,21,0,0,8,0,0,33,132,20,82,72,33,133,20,82,72,33,133,20,82,136,33,134,24,98,200,41,167,156,130,10,42,169,164,162,138,50,202,44,179,204,50,203,44,179,204,50,235,176,179,206,58,236,48,196,16,67,12,173,180,18,75,77,181,213,88,99,173,185,231,156,107,14,210,90,105,173,181,214,74,41,165,148,82,74,41,8,13,89,5,0,128,0,0,16,8,25,100,144,65,70,33,133,20,82,136,33,166,156,114,202,41,168,160,2,66,67,86,1,0,128,0,0,2,0,0,0,60,201,115,68,71,116,68,71,116,68,71,116,68,71,116,68,199,115,60,71,148,68,73,148,68,73,180,76,203,212,76,79,21,85,213,149,93,91,214,101,221,246,109,97,23,118,221,247,117,223,247,117,227,215,133,97,89,150,101,89,150,101,89,150,101,89,150,101,89,150,101,89,130,208,144,85,0,0,8,0,0,128,16,66,8,33,133,20,82,72,33,165,24,99,204,49,231,160,147,80,66,32,52,100,21,0,0,8,0,32,0,0,0,192,81,28,197,113,36,71,114,36,201,146,44,73,147,52,75,179,60,205,211,60,77,244,68,81,20,77,211,84,69,87,116,69,221,180,69,217,148,77,215,116,77,217,116,85,89,181,93,89,182,109,217,214,109,95,150,109,223,247,125,223,247,125,223,247,125,223,247,125,223,247,117,29,8,13,89,5,0,72,0,0,232,72,142,164,72,138,164,72,142,227,56,146,36,1,161,33,171,0,0,25,0,0,1,0,40,138,163,56,142,227,72,146,36,73,150,164,73,158,229,89,162,102,106,166,103,122,170,168,2,161,33,171,0,0,64,0,0,1,0,0,0,0,0,40,154,226,41,166,226,41,162,226,57,162,35,74,162,101,90,162,166,106,174,40,155,178,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,46,16,26,178,10,0,144,0,0,208,145,28,201,145,28,73,145,20,73,145,28,201,1,66,67,86,1,0,50,0,0,2,0,112,12,199,144,20,201,177,44,75,211,60,205,211,60,77,244,68,79,244,76,79,21,93,209,5,66,67,86,1,0,128,0,0,2,0,0,0,0,0,48,36,195,82,44,71,115,52,73,148,84,75,181,84,77,181,84,75,21,85,79,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,53,77,211,52,77,32,52,100,37,0,16,5,0,0,58,75,45,214,218,43,128,148,130,86,131,104,16,100,16,115,239,144,83,78,98,16,162,98,204,65,204,65,117,16,66,105,189,199,204,49,6,173,230,88,49,132,152,196,88,51,135,20,131,210,2,161,33,43,4,128,208,12,0,131,36,1,146,166,1,146,166,1,0,0,0,0,0,0,128,228,105,128,38,138,128,38,138,0,0,0,0,0,0,0,32,105,26,160,137,34,160,137,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,146,166,1,158,41,2,154,40,2,0,0,0,0,0,0,128,38,138,128,104,170,128,168,154,0,0,0,0,0,0,0,160,137,34,32,170,34,32,154,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,146,166,1,154,40,2,158,40,2,0,0,0,0,0,0,128,38,138,128,168,154,128,40,170,0,0,0,0,0,0,0,160,137,38,32,154,42,32,170,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,128,0,7,0,128,0,11,161,208,144,21,1,64,156,0,128,193,113,44,11,0,0,28,73,210,44,0,0,112,36,75,211,0,0,192,210,52,81,4,0,0,75,211,68,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,192,128,3,0,64,128,9,101,160,208,144,149,0,64,20,0,128,65,49,60,13,96,89,0,203,2,104,26,64,211,0,158,7,240,60,128,40,2,0,1,0,0,5,14,0,0,1,54,104,74,44,14,80,104,200,74,0,32,10,0,192,160,40,150,101,89,158,7,77,211,52,81,132,166,105,154,40,66,211,52,79,20,161,105,154,38,138,16,69,207,51,77,120,162,231,153,38,76,83,20,77,19,136,162,105,10,0,0,40,112,0,0,8,176,65,83,98,113,128,66,67,86,2,0,33,1,0,6,71,177,44,79,243,60,207,19,69,211,84,85,104,154,231,137,162,40,138,166,105,170,42,52,205,243,68,81,20,77,211,52,85,21,154,230,121,162,40,138,166,169,170,170,10,77,243,60,81,20,69,211,84,85,85,133,231,137,162,40,154,166,105,170,170,235,194,243,68,81,20,77,211,52,85,213,117,33,138,162,104,154,166,169,170,170,235,186,64,20,77,211,52,85,85,85,93,23,136,162,105,154,166,170,186,174,44,3,81,52,77,211,84,85,215,149,101,96,154,170,170,170,170,235,186,178,12,80,77,85,85,85,215,149,101,128,170,186,170,235,186,174,44,3,84,85,117,93,215,149,101,25,224,186,174,235,202,178,108,219,0,92,215,117,101,217,182,5,0,0,28,56,0,0,4,24,65,39,25,85,22,97,163,9,23,30,128,66,67,86,4,0,81,0,0,128,49,76,41,166,148,97,76,66,40,33,52,138,73,8,41,132,76,74,74,169,149,84,65,72,37,165,82,42,8,169,164,84,74,70,165,165,148,82,202,32,148,82,82,42,21,132,84,74,42,165,0,0,176,3,7,0,176,3,11,161,208,144,149,0,64,30,0,0,65,136,82,140,49,198,156,148,82,41,198,156,115,78,74,169,20,99,206,57,39,165,100,140,49,231,156,147,82,50,198,152,115,206,73,41,29,115,206,57,231,164,148,140,57,231,156,115,82,74,231,156,115,206,57,41,165,148,206,57,231,156,148,82,74,8,157,115,78,74,41,165,115,206,57,39,0,0,168,192,1,0,32,192,70,145,205,9,70,130,10,13,89,9,0,164,2,0,24,28,199,178,52,77,211,60,79,20,53,73,210,52,207,243,60,81,52,77,77,178,52,205,243,60,79,20,77,147,231,121,158,40,138,162,105,170,42,207,243,60,81,20,69,211,84,85,174,43,138,166,105,154,170,170,170,100,89,20,69,209,52,85,85,117,97,154,166,169,170,170,234,186,48,77,81,84,85,213,117,93,200,178,105,170,170,235,202,50,108,219,52,85,213,117,101,25,168,170,170,202,174,44,3,215,85,85,215,149,101,1,0,224,9,14,0,64,5,54,172,142,112,82,52,22,88,104,200,74,0,32,3,0,128,32,4,33,165,20,66,74,41,132,148,82,8,41,165,16,18,0,0,48,224,0,0,16,96,66,25,40,52,100,69,0,16,39,0,0,32,36,165,130,78,74,37,161,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,147,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,146,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,73,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,10,0,208,141,112,0,208,125,48,161,12,20,26,178,18,0,72,5,0,0,140,81,138,49,8,169,197,86,33,196,152,115,18,90,107,173,66,136,49,231,36,180,148,98,207,152,115,16,74,105,45,182,158,49,199,32,148,146,90,139,189,148,206,73,73,173,181,24,123,42,29,163,146,82,75,49,246,222,75,41,37,165,216,98,236,189,167,144,66,142,45,198,216,123,207,49,165,22,91,171,177,247,94,99,74,177,213,24,99,239,189,247,24,99,171,177,214,222,123,239,49,182,86,107,142,5,0,96,54,56,0,64,36,216,176,58,194,73,209,88,96,161,33,43,1,128,144,0,0,194,24,165,24,99,204,57,231,156,115,78,74,201,24,115,206,65,8,33,132,16,74,41,25,99,204,57,8,33,132,16,66,41,37,99,206,57,7,33,132,80,66,40,165,100,204,57,232,32,132,80,66,40,165,148,206,57,7,29,132,16,66,9,165,148,146,49,231,32,132,16,66,9,165,148,82,58,231,32,132,16,66,40,165,132,84,74,41,157,131,16,66,40,33,132,82,74,73,41,132,16,66,8,161,132,80,82,41,41,133,16,66,8,33,132,80,66,74,37,165,16,66,8,33,132,16,74,72,165,164,148,82,8,33,132,16,66,8,165,148,148,82,10,37,148,16,66,40,161,164,146,74,41,165,132,16,74,8,161,164,84,82,42,169,148,18,66,8,37,132,146,74,74,41,149,84,74,40,33,132,82,0,0,192,129,3,0,64,128,17,116,146,81,101,17,54,154,112,225,1,40,52,100,37,0,16,5,0,0,25,7,29,148,150,27,128,144,114,212,90,135,28,132,20,91,11,145,67,12,90,140,157,114,140,65,74,41,100,144,49,198,164,149,146,66,199,24,164,212,98,75,161,131,20,123,207,185,149,212,2,0,0,32,8,0,8,48,1,4,6,8,10,190,16,2,98,12,0,64,16,34,51,68,66,97,21,44,48,40,131,6,135,121,0,240,0,17,33,17,0,36,38,40,210,46,46,160,203,0,23,116,113,215,129,16,130,16,132,32,22,7,80,64,2,14,78,184,225,137,55,60,225,6,39,232,20,149,58,16,0,0,0,0,128,5,0,120,0,0,64,40,128,136,136,102,174,194,226,2,35,67,99,131,163,195,227,3,68,0,0,0,0,0,176,0,224,3,0,0,9,1,34,34,154,185,10,139,11,140,12,141,13,142,14,143,15,144,0,0,64,0,1,0,0,0,0,16,64,0,2,2,2,0,0,0,0,0,1,0,0,0,2,2,79,103,103,83,0,0,64,138,0,0,0,0,0,0,26,38,0,0,2,0,0,0,15,100,233,14,36,33,152,149,130,139,120,120,124,111,116,122,120,120,113,111,116,114,108,115,113,112,117,113,116,116,110,95,105,112,107,113,109,107,105,106,110,212,216,205,202,251,173,203,31,215,230,231,215,150,118,240,0,242,126,107,25,161,248,178,212,108,114,173,156,154,216,133,24,1,218,200,125,249,227,90,175,98,197,14,2,155,220,251,124,255,247,71,177,152,99,135,90,237,198,143,113,247,151,209,255,232,123,254,226,34,27,150,113,52,227,164,250,61,202,123,2,38,63,33,17,18,33,34,17,0,0,154,172,223,49,121,187,44,199,87,118,87,63,87,116,195,246,238,101,228,107,190,83,210,150,68,97,223,192,218,249,228,123,126,94,21,212,245,112,101,253,170,253,140,222,218,85,171,138,205,230,220,210,198,116,247,134,223,191,49,144,68,232,235,251,135,188,209,144,54,60,175,239,49,102,226,79,195,36,196,27,83,9,189,128,68,133,197,64,98,96,128,138,128,48,0,126,200,213,3,191,198,183,171,165,61,40,91,54,155,131,50,249,149,217,191,251,222,197,186,87,238,25,97,48,248,108,17,110,125,190,4,199,227,209,188,0,206,149,38,245,68,132,132,132,0,192,246,234,141,189,243,243,159,241,232,81,3,243,87,219,69,129,13,134,5,172,221,223,46,58,31,103,93,218,50,210,14,131,243,248,234,77,69,75,202,123,128,181,130,121,6,144,144,186,3,96,238,36,224,57,144,76,180,181,180,5,130,199,174,13,4,223,233,149,70,41,228,109,207,49,124,238,1,247,238,73,220,24,127,42,76,72,10,45,130,60,146,81,161,50,102,2,184,0,30,9,118,225,175,213,151,122,141,75,29,219,16,76,146,77,238,187,188,155,186,70,199,217,226,67,24,112,15,58,219,145,6,59,96,209,251,127,141,138,235,245,71,36,66,2,0,0,61,196,222,139,210,243,142,252,186,225,245,212,241,57,128,246,31,113,125,227,85,1,167,239,251,144,130,54,212,26,0,184,221,159,107,117,64,7,0,148,8,0,183,171,29,6,73,13,190,176,27,36,238,212,23,108,6,152,126,70,192,216,157,80,4,204,112,122,161,0,55,68,4,88,42,16,17,19,140,66,160,2,222,249,29,213,175,114,46,161,44,150,179,195,94,236,26,62,195,197,254,93,60,83,244,227,98,206,224,12,115,112,15,142,141,206,217,55,22,3,45,46,254,98,180,115,213,212,39,36,194,72,8,0,104,107,96,17,15,254,159,252,178,49,223,22,58,13,184,19,190,190,254,189,74,1,121,125,88,227,181,179,248,3,128,115,159,11,0,244,128,2,16,119,55,0,57,21,120,134,216,169,29,26,226,205,1,42,245,23,247,121,11,8,161,31,0,36,31,21,187,18,245,5,86,19,53,2,165,22,250,192,66,114,71,37,185,3,11,196,2,222,24,54,225,215,177,239,130,168,221,91,6,28,50,199,201,254,154,250,43,204,222,50,143,195,43,248,1,116,211,31,13,89,4,23,167,207,76,205,171,42,34,1,0,0,64,0,0,0,186,129,65,157,236,170,89,109,1,158,0,251,240,197,141,249,60,85,129,254,124,216,243,250,10,128,251,13,0,238,4,110,2,88,171,15,56,22,229,125,24,125,192,200,126,111,149,142,91,31,199,5,32,85,187,32,29,39,120,188,62,27,86,121,48,61,34,112,19,44,0,190,248,245,225,87,243,190,106,245,96,79,160,17,44,237,159,67,255,213,178,59,206,14,24,248,3,104,185,63,94,41,173,3,6,22,22,183,159,26,21,87,149,49,17,18,18,17,1,0,0,104,27,24,180,97,22,187,151,4,105,207,130,173,179,203,167,250,25,224,253,27,144,8,26,0,160,154,87,187,200,205,3,160,110,69,0,232,113,100,12,66,51,48,43,1,224,158,225,123,126,143,2,244,171,65,32,218,22,118,21,148,4,42,6,21,68,172,0,20,21,158,9,158,193,187,105,175,88,26,113,31,91,47,149,223,198,125,78,117,139,254,84,158,167,82,24,220,195,251,86,72,151,88,172,32,242,51,187,102,234,72,132,68,72,68,0,0,0,172,8,164,235,239,147,166,78,233,123,113,215,233,103,53,127,247,255,214,111,191,107,124,190,1,34,61,13,164,124,212,122,1,160,106,5,0,164,155,48,253,90,128,159,0,132,86,135,97,79,105,116,167,252,251,85,7,234,244,114,67,60,91,47,6,21,93,10,17,129,0,92,3,212,4,36,94,249,221,185,71,217,119,209,159,44,236,29,97,54,45,65,37,120,36,223,243,246,43,99,177,204,109,31,252,1,104,93,60,51,140,162,3,128,79,187,93,241,121,36,68,0,0,32,2,0,0,112,16,160,247,154,99,175,58,32,251,1,95,225,110,191,242,158,239,174,129,222,60,46,80,44,16,81,2,0,173,10,228,168,25,0,78,3,166,3,63,99,121,157,126,20,108,174,0,145,146,47,198,27,4,84,21,148,1,131,8,222,200,157,208,171,105,187,88,230,170,158,109,21,26,187,147,253,58,238,71,104,151,120,182,45,248,1,216,111,107,135,112,9,168,44,98,62,79,137,16,9,9,9,0,0,142,27,236,115,220,156,127,30,79,107,225,116,1,220,50,83,98,210,79,223,57,253,87,32,63,173,0,183,171,104,186,14,0,232,13,0,200,67,49,125,49,68,58,27,169,35,167,240,90,54,26,209,5,0,149,128,193,182,29,113,113,33,50,144,128,129,75,228,66,177,0,222,200,221,149,123,49,119,181,206,135,60,119,172,8,60,114,39,252,209,138,91,245,187,19,207,182,6,63,12,88,157,124,198,162,7,39,158,198,81,169,106,34,34,68,66,68,0,0,232,109,176,244,218,93,143,191,247,150,50,119,71,127,21,136,251,104,65,231,231,163,247,207,74,113,244,4,144,101,132,117,176,194,178,50,32,200,233,158,184,35,2,176,18,108,53,132,59,138,1,160,36,6,149,237,244,251,58,221,41,194,34,168,10,36,10,176,72,144,80,80,48,0,190,200,61,149,123,111,93,93,103,209,157,29,114,241,1,120,228,206,228,187,244,71,245,63,228,189,205,66,120,157,240,197,58,20,231,171,68,136,132,72,132,8,0,248,23,204,87,127,190,164,158,178,99,103,11,105,197,163,103,42,26,241,77,127,112,123,187,247,247,29,2,209,133,2,54,42,77,0,160,44,78,134,44,171,15,152,178,206,240,3,144,75,25,14,200,249,45,119,85,36,0,110,167,193,39,137,192,60,37,92,44,44,42,48,46,4,18,24,46,0,62,200,157,148,71,141,165,214,93,172,123,235,143,112,182,74,35,119,34,94,237,254,40,251,161,59,219,44,198,7,82,36,131,52,154,21,127,68,68,68,66,4,0,128,242,141,145,246,219,233,252,193,44,173,68,139,122,227,50,236,173,155,14,105,189,129,175,245,189,235,128,38,207,19,166,41,69,228,1,96,19,208,145,17,56,230,0,236,38,144,50,233,253,57,214,5,0,128,85,51,30,240,136,67,251,79,33,7,23,43,194,2,149,129,203,197,64,160,130,8,126,200,157,148,103,246,71,172,173,87,231,209,208,135,72,238,78,190,106,123,84,223,122,113,111,192,7,90,6,48,22,94,175,38,36,36,66,66,0,0,40,200,20,166,139,109,126,122,154,198,198,74,171,80,200,41,244,104,42,24,29,36,251,61,96,13,200,87,164,187,46,27,110,10,0,170,199,147,213,56,3,96,13,0,184,34,33,126,157,51,146,201,107,32,0,176,232,80,141,36,94,20,184,17,21,10,5,88,3,68,92,10,22,94,200,157,248,103,230,174,214,185,200,123,107,24,193,34,119,38,95,109,220,202,206,194,222,78,203,1,31,104,71,247,2,208,219,55,117,17,137,144,8,9,145,0,0,80,15,128,39,243,195,129,73,33,183,245,215,42,6,25,4,243,197,173,221,19,52,0,73,58,7,9,33,101,7,49,35,174,62,53,112,10,0,93,3,114,144,129,156,50,99,212,24,10,34,128,160,160,114,37,177,20,8,16,145,48,112,69,136,32,98,0,94,200,237,240,53,155,159,90,238,69,215,182,243,191,151,66,238,193,223,14,190,148,155,117,111,13,24,60,67,128,195,12,197,185,35,87,71,66,66,68,68,68,0,0,248,87,99,187,65,174,237,41,111,173,74,156,102,52,61,220,120,214,187,163,186,247,214,17,197,60,41,197,125,235,74,163,25,234,62,156,24,101,253,214,75,64,80,101,0,104,234,193,167,80,54,5,207,96,23,42,151,228,81,135,141,12,12,20,3,72,42,21,40,42,21,2,222,199,109,252,125,182,142,186,158,47,245,108,215,243,186,41,228,206,202,189,153,183,234,247,37,206,237,122,105,47,94,112,214,24,174,120,149,136,136,8,9,9,0,0,176,2,224,175,198,172,14,74,168,163,106,118,172,154,29,197,127,249,202,175,255,250,56,7,216,173,119,77,166,124,193,141,41,142,130,206,226,31,1,192,93,101,32,37,197,129,75,152,0,214,43,241,212,5,140,52,64,23,151,4,73,69,36,1,9,151,75,5,119,0,190,199,109,193,99,126,126,213,143,213,98,235,208,25,26,185,59,113,47,227,83,245,94,228,177,141,192,7,62,88,64,136,185,130,143,68,72,72,136,72,0,0,168,251,1,57,184,136,73,190,177,82,159,200,188,38,4,26,109,19,149,38,198,5,0,27,21,217,7,55,1,144,148,0,64,37,193,57,207,169,28,0,61,36,164,120,160,191,89,203,120,28,35,21,35,119,73,42,24,72,42,6,72,40,3,168,68,8,126,200,189,170,219,169,47,213,237,203,213,182,158,31,15,53,139,220,157,124,180,239,167,140,75,111,235,78,194,171,140,23,28,213,178,152,74,241,145,144,16,9,145,16,0,0,90,207,64,35,74,58,60,36,223,25,35,88,190,16,204,186,243,106,223,116,107,61,43,1,57,81,108,3,90,0,112,1,191,8,0,245,240,90,0,124,85,196,195,13,147,169,58,221,69,160,36,184,139,48,6,55,63,128,74,65,65,178,128,34,194,194,64,197,2,190,200,61,137,123,185,118,181,236,7,99,11,118,37,146,123,1,247,218,95,213,63,23,217,14,59,11,227,5,247,210,182,132,85,165,0,18,34,34,33,17,0,0,210,225,53,38,152,44,62,218,234,99,231,233,65,161,83,49,178,31,112,235,135,171,125,206,36,97,239,21,164,230,27,140,77,56,230,133,155,35,5,0,177,169,2,112,58,192,205,25,31,234,1,0,181,25,113,1,192,77,118,129,85,33,65,129,84,81,192,98,33,0,94,200,157,184,103,123,255,170,59,159,148,45,144,43,135,220,67,185,105,250,160,50,126,179,218,38,240,67,0,121,78,78,5,48,90,213,188,138,136,72,136,132,8,0,64,54,96,247,112,224,213,233,52,223,19,106,216,212,100,158,171,57,159,23,116,155,18,71,65,23,92,0,128,93,130,28,55,114,179,0,52,169,6,192,205,208,26,213,177,201,41,135,91,171,227,7,128,169,137,72,0,5,67,192,128,68,128,10,110,0,129,8,94,200,45,240,83,171,163,122,252,244,130,237,186,250,85,10,185,51,249,152,214,163,204,7,109,139,69,118,197,15,125,129,85,255,84,171,253,14,16,14,174,171,34,144,8,17,9,145,16,0,0,220,27,145,18,214,243,242,125,89,247,100,116,104,49,172,245,204,250,189,221,79,23,208,133,8,96,21,176,1,25,0,168,0,128,6,0,208,84,224,53,195,74,12,92,55,246,100,148,168,148,64,4,128,50,64,36,72,160,96,145,16,32,65,12,64,5,158,200,93,137,135,214,7,149,241,97,177,67,119,39,252,47,162,145,123,67,151,222,95,213,205,75,111,135,10,188,78,168,124,181,240,194,142,72,132,136,136,132,4,0,248,75,66,214,120,249,151,214,158,251,82,78,133,44,29,122,184,236,188,89,117,135,208,213,77,33,217,180,24,133,195,1,0,215,143,24,130,115,129,125,2,0,173,192,58,85,239,171,213,139,135,15,71,42,70,158,132,68,69,128,139,197,101,192,5,75,133,194,0,190,200,221,130,155,218,6,149,221,233,108,237,45,100,114,159,250,214,214,175,140,94,111,219,130,15,99,244,9,140,81,180,121,68,36,36,36,68,4,0,224,44,94,216,184,184,238,178,242,79,86,191,216,32,116,128,70,75,106,99,31,17,207,41,213,115,43,117,60,5,80,222,226,38,3,32,21,128,210,165,161,123,95,52,6,208,167,130,247,185,184,223,125,127,206,182,111,178,202,44,164,87,184,22,84,22,20,42,46,68,112,9,2,92,84,0,254,201,125,155,187,138,23,149,118,169,182,6,22,106,187,127,198,107,244,83,10,209,94,214,224,25,153,70,146,45,204,219,115,165,20,0,68,68,68,68,136,72,0,236,155,215,183,203,147,194,155,139,3,177,41,226,91,157,254,22,119,167,198,90,92,120,127,84,194,60,69,146,235,9,18,7,244,71,144,97,188,27,16,161,2,192,55,48,238,111,10,163,130,170,114,85,71,59,11,168,9,80,145,40,24,32,33,42,24,24,192,194,66,225,127,4,254,201,125,249,135,210,73,57,61,182,155,93,53,188,126,127,165,171,162,36,52,162,51,175,130,151,132,198,250,92,69,64,136,0,32,32,36,64,0,98,63,137,160,125,217,113,240,70,118,154,52,213,236,186,104,215,23,155,241,197,178,147,235,56,88,63,19,129,30,173,19,209,47,54,148,220,168,143,149,51,138,232,132,145,242,114,192,169,146,204,41,83,30,73,198,174,247,19,111,73,40,4,10,46,10,168,21,4,24,84,158,201,125,249,155,230,18,133,55,217,182,192,172,120,179,246,61,250,9,200,142,103,128,215,128,222,162,184,74,0,32,0,0,0,0,0,0,0,32,233,212,122,7,165,246,100,230,196,225,214,202,44,130,139,122,61,240,61,62,151,187,219,213,62,117,166,67,65,156,41,71,5,16,26,108,227,202,214,42,96,34,107,5,2,88,25,240,90,73,91,37,37,175,121,34,94,201,125,209,203,52,95,229,73,111,107,208,194,43,120,179,227,158,248,148,77,103,91,68,120,13,120,219,57,59,0,132,8,0,64,34,0,0,64,97,103,10,187,139,207,44,10,122,79,47,15,243,57,163,11,145,205,183,120,230,219,149,189,17,221,140,131,121,37,161,85,80,112,147,187,77,216,59,251,51,176,10,154,211,65,143,44,131,18,216,94,207,214,106,157,21,171,162,194,194,21,64,50,16,0,254,200,189,210,171,166,133,74,171,216,50,206,161,180,251,237,47,42,23,42,187,147,108,77,4,62,87,64,83,159,64,111,17,150,15,144,144,0,34,34,2,0,0,52,190,251,73,87,197,97,37,157,76,63,147,111,255,129,198,246,106,155,113,255,204,154,206,121,99,119,102,191,215,158,170,231,141,115,73,64,186,5,2,248,18,228,152,201,250,223,3,200,119,50,37,243,126,227,144,37,172,165,72,72,8,8,10,88,10,12,34,2,126,201,125,177,107,123,127,202,252,16,109,11,140,118,127,187,179,61,175,112,86,217,177,128,207,6,252,22,52,22,89,41,0,16,145,16,145,144,8,0,0,189,199,231,80,6,7,171,162,124,243,68,187,53,155,90,29,240,192,70,195,221,31,127,218,114,173,165,210,101,33,76,154,236,78,128,157,197,248,105,177,162,125,147,44,128,230,84,129,219,5,32,36,117,186,32,32,93,40,16,176,176,184,144,176,8,0,254,200,125,136,237,172,125,202,254,192,22,4,169,220,127,235,153,186,149,249,194,22,2,94,139,223,88,148,214,138,0,34,18,33,33,18,2,0,240,54,217,11,112,70,245,26,18,78,15,206,227,226,72,188,18,46,58,60,28,208,237,126,53,60,223,158,205,178,213,207,10,146,237,129,174,0,132,6,138,245,21,0,55,97,48,81,133,136,33,87,77,157,0,200,81,6,1,128,212,72,116,160,98,128,100,64,53,96,128,42,192,128,8,254,200,125,178,51,237,85,78,135,45,26,13,156,114,255,180,83,153,168,180,94,176,117,232,25,188,224,109,173,171,194,70,68,68,68,36,34,0,8,224,116,253,159,246,128,25,30,147,2,43,243,49,70,183,67,51,134,175,246,227,19,23,158,107,213,217,109,49,91,139,112,16,30,228,0,113,157,167,230,184,129,215,142,130,125,4,100,164,217,161,23,22,194,125,70,183,48,64,148,128,101,64,68,129,181,128,203,197,0,126,200,125,226,61,113,171,254,126,88,109,196,124,114,127,197,109,230,167,148,135,106,219,130,211,152,87,4,0,18,17,17,17,34,0,128,209,246,17,243,43,50,146,187,111,58,110,10,195,156,219,166,83,167,79,34,22,246,199,254,249,71,244,69,86,254,105,206,198,30,121,127,37,34,69,124,13,215,46,170,21,196,170,16,193,36,114,59,8,146,28,172,206,105,96,30,37,32,36,48,88,96,41,80,33,70,0,222,200,125,192,109,179,127,74,123,137,246,116,72,16,201,125,210,115,190,255,74,187,176,77,224,117,178,104,59,42,61,64,36,2,136,72,72,0,0,188,246,91,152,101,135,109,254,176,102,114,195,128,200,18,71,114,28,159,212,33,141,16,149,204,147,68,136,40,101,131,212,232,18,1,56,93,184,237,4,160,187,0,224,164,12,210,139,223,122,156,138,193,10,40,84,12,20,22,46,6,36,144,80,136,0,126,201,253,212,103,230,175,88,116,182,53,108,114,191,244,169,230,70,165,172,216,246,133,241,145,176,128,48,42,206,7,72,132,132,72,68,4,0,0,69,98,84,131,123,222,61,226,78,218,206,119,134,48,138,25,7,184,181,198,133,149,21,150,82,86,222,154,142,67,57,0,168,113,221,12,135,54,2,112,117,34,40,0,196,41,177,58,215,250,219,148,185,94,14,23,20,18,170,8,5,17,2,162,138,5,9,190,201,221,220,45,105,187,50,126,97,139,53,64,38,247,183,217,83,183,210,62,176,197,70,224,180,212,138,83,36,36,68,36,34,4,0,16,3,172,135,113,207,22,253,255,205,183,254,253,122,191,209,70,92,85,137,7,250,241,107,100,152,54,81,109,52,2,147,238,97,44,26,93,154,72,120,223,137,1,146,2,205,73,48,210,119,131,60,60,67,104,15,13,196,16,16,33,36,16,160,160,74,144,44,48,184,80,9,72,0,79,103,103,83,0,4,75,174,0,0,0,0,0,0,26,38,0,0,3,0,0,0,153,132,137,86,10,109,107,107,102,108,103,111,111,109,33,158,201,253,240,91,165,161,50,58,108,175,133,8,149,220,79,113,40,19,42,237,37,219,154,24,92,128,180,72,174,18,64,36,4,136,72,68,0,128,83,133,21,30,76,141,106,5,193,3,233,164,197,209,231,204,250,241,127,122,20,249,47,190,212,218,90,118,97,117,167,48,223,16,10,116,161,184,141,221,91,0,201,169,186,1,128,84,130,59,161,118,234,109,12,199,71,168,127,33,85,80,168,96,33,89,24,72,92,0,62,201,125,153,83,211,68,101,46,178,237,73,120,228,222,245,86,211,98,229,94,36,219,163,68,97,188,4,172,93,24,155,8,17,17,17,145,144,0,0,224,147,184,59,164,122,72,165,130,189,75,209,182,91,139,136,120,117,233,43,167,55,165,195,45,132,118,30,51,34,85,1,80,14,60,23,0,208,64,168,186,133,23,78,229,169,221,149,212,90,150,84,31,19,238,156,168,0,137,96,1,129,164,2,139,168,0,190,200,125,209,189,93,191,178,31,162,109,129,70,238,93,158,106,110,168,156,15,201,182,10,94,130,151,177,203,71,68,68,128,68,72,4,0,128,172,120,26,21,194,230,53,196,218,247,186,50,26,11,187,67,155,98,240,247,75,93,74,199,55,227,252,114,129,30,172,75,147,132,156,43,64,9,83,9,249,228,251,107,113,160,19,237,140,246,120,189,237,86,170,122,174,33,194,133,200,192,130,161,0,145,197,66,5,222,200,189,137,173,154,157,149,209,137,182,85,49,147,220,151,59,149,69,202,164,218,30,197,4,159,197,75,2,210,190,154,16,137,144,0,34,34,0,0,59,34,36,147,13,64,193,227,140,218,21,40,147,193,158,251,229,229,186,46,33,26,109,100,0,67,168,68,55,195,202,240,189,201,39,3,224,83,131,247,59,35,126,196,58,250,49,83,168,210,18,84,80,17,113,137,16,5,44,184,46,0,158,200,189,179,83,237,14,133,77,117,52,96,153,74,238,151,223,19,191,178,233,109,179,24,175,197,203,90,52,79,9,137,136,136,136,136,0,0,48,53,208,160,35,216,93,47,220,109,61,73,211,25,115,173,89,243,95,63,107,252,174,143,221,133,48,46,247,160,227,148,208,83,123,8,17,169,39,25,64,19,184,93,128,169,37,120,141,76,218,83,75,249,79,72,203,7,3,10,5,6,11,67,192,128,130,8,66,2,190,200,125,177,61,243,87,198,165,218,30,53,165,28,114,239,240,200,254,43,237,33,217,158,4,31,133,19,6,16,22,197,39,128,132,68,136,132,72,0,0,208,225,127,213,57,10,116,79,205,227,28,75,42,18,168,50,212,154,222,104,38,130,7,160,65,100,91,161,217,3,128,10,201,205,179,178,3,202,104,19,188,102,233,119,155,13,98,131,17,45,12,196,202,101,1,41,32,128,193,98,193,0,254,200,125,155,93,233,80,73,85,181,117,232,5,18,185,119,121,106,76,84,70,196,118,112,5,31,197,45,180,221,2,244,22,81,126,66,36,66,66,68,36,0,0,88,175,97,253,250,203,254,111,89,43,115,191,167,243,209,161,123,41,144,145,59,170,46,77,42,4,251,156,161,230,37,36,128,193,85,88,240,225,96,4,100,169,51,252,175,252,146,193,127,69,185,145,14,97,62,204,225,146,88,12,112,17,9,4,80,41,96,1,94,200,221,138,173,218,67,202,36,216,30,239,81,230,144,123,23,71,115,255,202,189,138,182,39,53,188,78,248,61,22,205,39,66,66,4,68,68,68,0,0,208,253,114,173,239,142,167,78,77,110,50,177,201,32,19,70,33,25,140,237,78,254,166,225,189,221,29,30,145,168,115,104,172,30,66,210,0,192,53,4,128,148,35,45,6,73,81,25,216,182,131,250,110,95,251,88,66,130,128,128,202,32,1,139,68,164,128,8,213,0,190,200,253,241,83,125,30,97,254,134,19,160,2,145,220,159,180,142,245,170,238,172,130,29,118,11,62,23,198,36,240,173,145,243,9,0,34,0,0,1,66,0,0,128,151,179,231,65,239,108,232,198,236,211,246,104,195,13,10,160,86,149,73,224,179,68,209,127,21,227,180,170,244,227,235,229,74,184,94,156,166,224,240,237,27,8,32,77,220,240,140,177,92,86,65,63,172,152,244,191,94,240,169,18,12,18,34,18,23,158,200,253,239,44,95,186,0,110,32,145,251,223,89,190,116,1,220,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

    //Dance Of The Sugar Plum Fairy - second half of the first bar (from https://commons.wikimedia.org/wiki/File:Dance_of_the_Sugar_Plum_Fairies_(ISRC_USUAN1100270).oga)
    var dspf2 = [79,103,103,83,0,2,0,0,0,0,0,0,0,0,153,38,0,0,0,0,0,0,102,246,55,121,1,30,1,118,111,114,98,105,115,0,0,0,0,2,68,172,0,0,0,0,0,0,0,250,0,0,0,0,0,0,184,1,79,103,103,83,0,0,0,0,0,0,0,0,0,0,153,38,0,0,1,0,0,0,236,82,16,175,16,59,255,255,255,255,255,255,255,255,255,255,255,255,255,255,193,3,118,111,114,98,105,115,43,0,0,0,88,105,112,104,46,79,114,103,32,108,105,98,86,111,114,98,105,115,32,73,32,50,48,49,50,48,50,48,51,32,40,79,109,110,105,112,114,101,115,101,110,116,41,0,0,0,0,1,5,118,111,114,98,105,115,33,66,67,86,1,0,0,1,0,24,99,84,41,70,153,82,210,74,137,25,115,148,49,70,153,98,146,74,137,165,132,22,66,72,157,115,20,83,169,57,215,156,107,172,185,181,32,132,16,26,83,80,41,5,153,82,142,82,105,25,99,144,41,5,153,82,16,75,73,37,116,18,58,39,157,99,16,91,73,193,214,152,107,139,65,182,28,132,13,154,82,76,41,196,148,82,138,66,8,25,83,140,41,197,148,82,74,66,7,37,116,14,58,230,28,83,142,74,40,65,184,156,115,171,181,150,150,99,139,169,116,146,74,231,36,100,76,66,72,41,133,146,74,7,165,83,78,66,72,53,150,214,82,41,29,115,82,82,106,65,232,32,132,16,66,182,32,132,13,130,208,144,85,0,0,1,0,192,64,16,26,178,10,0,80,0,0,16,138,161,24,138,2,132,134,172,2,0,50,0,0,4,160,40,142,226,40,142,35,57,146,99,73,22,16,26,178,10,0,0,2,0,16,0,0,192,112,20,73,145,20,201,177,36,75,210,44,75,211,68,81,85,125,213,54,85,85,246,117,93,215,117,93,215,117,32,52,100,21,0,0,1,0,64,72,167,153,165,26,32,194,12,100,24,8,13,89,5,0,32,0,0,0,70,40,194,16,3,66,67,86,1,0,0,1,0,0,98,40,57,136,38,180,230,124,115,142,131,102,57,104,42,197,230,116,112,34,213,230,73,110,42,230,230,156,115,206,57,39,155,115,198,56,231,156,115,138,114,102,49,104,38,180,230,156,115,18,131,102,41,104,38,180,230,156,115,158,196,230,65,107,170,180,230,156,115,198,57,167,131,113,70,24,231,156,115,154,180,230,65,106,54,214,230,156,115,22,180,166,57,106,46,197,230,156,115,34,229,230,73,109,46,213,230,156,115,206,57,231,156,115,206,57,231,156,115,170,23,167,115,112,78,56,231,156,115,162,246,230,90,110,66,23,231,156,115,62,25,167,123,115,66,56,231,156,115,206,57,231,156,115,206,57,231,156,115,130,208,144,85,0,0,16,0,0,65,24,54,134,113,167,32,72,159,163,129,24,69,136,105,200,164,7,221,163,195,36,104,12,114,10,169,71,163,163,145,82,234,32,148,84,198,73,41,157,32,52,100,21,0,0,8,0,0,33,132,20,82,72,33,133,20,82,72,33,133,20,82,136,33,134,24,98,200,41,167,156,130,10,42,169,164,162,138,50,202,44,179,204,50,203,44,179,204,50,235,176,179,206,58,236,48,196,16,67,12,173,180,18,75,77,181,213,88,99,173,185,231,156,107,14,210,90,105,173,181,214,74,41,165,148,82,74,41,8,13,89,5,0,128,0,0,16,8,25,100,144,65,70,33,133,20,82,136,33,166,156,114,202,41,168,160,2,66,67,86,1,0,128,0,0,2,0,0,0,60,201,115,68,71,116,68,71,116,68,71,116,68,71,116,68,199,115,60,71,148,68,73,148,68,73,180,76,203,212,76,79,21,85,213,149,93,91,214,101,221,246,109,97,23,118,221,247,117,223,247,117,227,215,133,97,89,150,101,89,150,101,89,150,101,89,150,101,89,150,101,89,130,208,144,85,0,0,8,0,0,128,16,66,8,33,133,20,82,72,33,165,24,99,204,49,231,160,147,80,66,32,52,100,21,0,0,8,0,32,0,0,0,192,81,28,197,113,36,71,114,36,201,146,44,73,147,52,75,179,60,205,211,60,77,244,68,81,20,77,211,84,69,87,116,69,221,180,69,217,148,77,215,116,77,217,116,85,89,181,93,89,182,109,217,214,109,95,150,109,223,247,125,223,247,125,223,247,125,223,247,125,223,247,117,29,8,13,89,5,0,72,0,0,232,72,142,164,72,138,164,72,142,227,56,146,36,1,161,33,171,0,0,25,0,0,1,0,40,138,163,56,142,227,72,146,36,73,150,164,73,158,229,89,162,102,106,166,103,122,170,168,2,161,33,171,0,0,64,0,0,1,0,0,0,0,0,40,154,226,41,166,226,41,162,226,57,162,35,74,162,101,90,162,166,106,174,40,155,178,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,46,16,26,178,10,0,144,0,0,208,145,28,201,145,28,73,145,20,73,145,28,201,1,66,67,86,1,0,50,0,0,2,0,112,12,199,144,20,201,177,44,75,211,60,205,211,60,77,244,68,79,244,76,79,21,93,209,5,66,67,86,1,0,128,0,0,2,0,0,0,0,0,48,36,195,82,44,71,115,52,73,148,84,75,181,84,77,181,84,75,21,85,79,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,53,77,211,52,77,32,52,100,37,0,16,5,0,0,58,75,45,214,218,43,128,148,130,86,131,104,16,100,16,115,239,144,83,78,98,16,162,98,204,65,204,65,117,16,66,105,189,199,204,49,6,173,230,88,49,132,152,196,88,51,135,20,131,210,2,161,33,43,4,128,208,12,0,131,36,1,146,166,1,146,166,1,0,0,0,0,0,0,128,228,105,128,38,138,128,38,138,0,0,0,0,0,0,0,32,105,26,160,137,34,160,137,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,146,166,1,158,41,2,154,40,2,0,0,0,0,0,0,128,38,138,128,104,170,128,168,154,0,0,0,0,0,0,0,160,137,34,32,170,34,32,154,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,146,166,1,154,40,2,158,40,2,0,0,0,0,0,0,128,38,138,128,168,154,128,40,170,0,0,0,0,0,0,0,160,137,38,32,154,42,32,170,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,128,0,7,0,128,0,11,161,208,144,21,1,64,156,0,128,193,113,44,11,0,0,28,73,210,44,0,0,112,36,75,211,0,0,192,210,52,81,4,0,0,75,211,68,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,192,128,3,0,64,128,9,101,160,208,144,149,0,64,20,0,128,65,49,60,13,96,89,0,203,2,104,26,64,211,0,158,7,240,60,128,40,2,0,1,0,0,5,14,0,0,1,54,104,74,44,14,80,104,200,74,0,32,10,0,192,160,40,150,101,89,158,7,77,211,52,81,132,166,105,154,40,66,211,52,79,20,161,105,154,38,138,16,69,207,51,77,120,162,231,153,38,76,83,20,77,19,136,162,105,10,0,0,40,112,0,0,8,176,65,83,98,113,128,66,67,86,2,0,33,1,0,6,71,177,44,79,243,60,207,19,69,211,84,85,104,154,231,137,162,40,138,166,105,170,42,52,205,243,68,81,20,77,211,52,85,21,154,230,121,162,40,138,166,169,170,170,10,77,243,60,81,20,69,211,84,85,85,133,231,137,162,40,154,166,105,170,170,235,194,243,68,81,20,77,211,52,85,213,117,33,138,162,104,154,166,169,170,170,235,186,64,20,77,211,52,85,85,85,93,23,136,162,105,154,166,170,186,174,44,3,81,52,77,211,84,85,215,149,101,96,154,170,170,170,170,235,186,178,12,80,77,85,85,85,215,149,101,128,170,186,170,235,186,174,44,3,84,85,117,93,215,149,101,25,224,186,174,235,202,178,108,219,0,92,215,117,101,217,182,5,0,0,28,56,0,0,4,24,65,39,25,85,22,97,163,9,23,30,128,66,67,86,4,0,81,0,0,128,49,76,41,166,148,97,76,66,40,33,52,138,73,8,41,132,76,74,74,169,149,84,65,72,37,165,82,42,8,169,164,84,74,70,165,165,148,82,202,32,148,82,82,42,21,132,84,74,42,165,0,0,176,3,7,0,176,3,11,161,208,144,149,0,64,30,0,0,65,136,82,140,49,198,156,148,82,41,198,156,115,78,74,169,20,99,206,57,39,165,100,140,49,231,156,147,82,50,198,152,115,206,73,41,29,115,206,57,231,164,148,140,57,231,156,115,82,74,231,156,115,206,57,41,165,148,206,57,231,156,148,82,74,8,157,115,78,74,41,165,115,206,57,39,0,0,168,192,1,0,32,192,70,145,205,9,70,130,10,13,89,9,0,164,2,0,24,28,199,178,52,77,211,60,79,20,53,73,210,52,207,243,60,81,52,77,77,178,52,205,243,60,79,20,77,147,231,121,158,40,138,162,105,170,42,207,243,60,81,20,69,211,84,85,174,43,138,166,105,154,170,170,170,100,89,20,69,209,52,85,85,117,97,154,166,169,170,170,234,186,48,77,81,84,85,213,117,93,200,178,105,170,170,235,202,50,108,219,52,85,213,117,101,25,168,170,170,202,174,44,3,215,85,85,215,149,101,1,0,224,9,14,0,64,5,54,172,142,112,82,52,22,88,104,200,74,0,32,3,0,128,32,4,33,165,20,66,74,41,132,148,82,8,41,165,16,18,0,0,48,224,0,0,16,96,66,25,40,52,100,69,0,16,39,0,0,32,36,165,130,78,74,37,161,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,147,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,146,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,73,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,10,0,208,141,112,0,208,125,48,161,12,20,26,178,18,0,72,5,0,0,140,81,138,49,8,169,197,86,33,196,152,115,18,90,107,173,66,136,49,231,36,180,148,98,207,152,115,16,74,105,45,182,158,49,199,32,148,146,90,139,189,148,206,73,73,173,181,24,123,42,29,163,146,82,75,49,246,222,75,41,37,165,216,98,236,189,167,144,66,142,45,198,216,123,207,49,165,22,91,171,177,247,94,99,74,177,213,24,99,239,189,247,24,99,171,177,214,222,123,239,49,182,86,107,142,5,0,96,54,56,0,64,36,216,176,58,194,73,209,88,96,161,33,43,1,128,144,0,0,194,24,165,24,99,204,57,231,156,115,78,74,201,24,115,206,65,8,33,132,16,74,41,25,99,204,57,8,33,132,16,66,41,37,99,206,57,7,33,132,80,66,40,165,100,204,57,232,32,132,80,66,40,165,148,206,57,7,29,132,16,66,9,165,148,146,49,231,32,132,16,66,9,165,148,82,58,231,32,132,16,66,40,165,132,84,74,41,157,131,16,66,40,33,132,82,74,73,41,132,16,66,8,161,132,80,82,41,41,133,16,66,8,33,132,80,66,74,37,165,16,66,8,33,132,16,74,72,165,164,148,82,8,33,132,16,66,8,165,148,148,82,10,37,148,16,66,40,161,164,146,74,41,165,132,16,74,8,161,164,84,82,42,169,148,18,66,8,37,132,146,74,74,41,149,84,74,40,33,132,82,0,0,192,129,3,0,64,128,17,116,146,81,101,17,54,154,112,225,1,40,52,100,37,0,16,5,0,0,25,7,29,148,150,27,128,144,114,212,90,135,28,132,20,91,11,145,67,12,90,140,157,114,140,65,74,41,100,144,49,198,164,149,146,66,199,24,164,212,98,75,161,131,20,123,207,185,149,212,2,0,0,32,8,0,8,48,1,4,6,8,10,190,16,2,98,12,0,64,16,34,51,68,66,97,21,44,48,40,131,6,135,121,0,240,0,17,33,17,0,36,38,40,210,46,46,160,203,0,23,116,113,215,129,16,130,16,132,32,22,7,80,64,2,14,78,184,225,137,55,60,225,6,39,232,20,149,58,16,0,0,0,0,128,5,0,120,0,0,64,40,128,136,136,102,174,194,226,2,35,67,99,131,163,195,227,3,68,0,0,0,0,0,176,0,224,3,0,0,9,1,34,34,154,185,10,139,11,140,12,141,13,142,14,143,15,144,0,0,64,0,1,0,0,0,0,16,64,0,2,2,2,0,0,0,0,0,1,0,0,0,2,2,79,103,103,83,0,0,64,134,0,0,0,0,0,0,153,38,0,0,2,0,0,0,144,87,153,135,35,31,159,128,118,126,155,145,136,131,130,133,125,124,122,126,117,121,114,125,122,123,116,120,117,119,120,114,103,110,118,108,113,110,110,104,236,214,232,219,27,100,151,63,241,204,139,246,113,27,192,3,176,131,139,191,219,61,201,159,70,172,20,197,169,10,3,186,200,29,221,231,85,77,172,58,235,152,170,141,129,75,238,234,63,244,127,73,65,63,118,196,115,112,198,191,0,83,31,254,227,231,237,251,219,177,32,91,11,195,161,185,202,71,66,36,66,66,2,0,160,217,172,70,35,230,117,217,255,112,205,222,188,205,123,71,57,140,221,225,225,74,173,246,59,224,217,180,174,5,182,182,118,249,51,49,157,123,124,175,55,135,182,214,185,237,134,221,237,243,234,106,213,123,239,133,212,5,241,15,164,176,176,144,223,127,94,235,254,107,37,9,0,208,211,63,1,54,244,175,127,119,248,169,0,128,164,147,201,211,154,138,13,241,127,42,23,23,11,68,140,11,21,145,139,10,30,106,238,232,243,137,18,191,238,228,81,118,132,135,81,78,71,167,185,40,159,207,59,197,167,85,247,62,33,7,183,24,247,112,30,167,223,55,191,216,208,2,184,115,92,128,11,40,197,141,136,4,0,1,0,0,0,0,128,14,238,112,250,223,120,1,82,203,60,255,251,129,135,1,196,146,62,121,194,195,59,48,96,214,91,231,8,143,245,6,65,255,0,60,8,148,240,110,248,16,0,100,253,1,205,0,128,244,13,106,124,72,0,32,247,188,221,115,2,0,116,25,128,118,15,138,0,10,62,89,246,193,199,54,27,251,117,200,207,99,18,38,20,61,170,239,186,92,60,208,191,15,82,220,195,245,14,239,126,19,58,99,131,205,157,4,44,2,138,213,9,1,32,0,0,0,0,0,192,192,157,230,208,162,24,238,79,179,106,150,180,8,193,34,123,72,30,88,8,0,210,250,14,192,109,218,39,68,128,104,126,223,64,64,0,212,255,20,0,160,39,192,123,232,28,16,61,201,74,11,227,54,1,96,238,29,132,200,234,103,221,187,129,11,174,1,222,24,54,214,247,156,82,43,194,115,187,48,35,33,70,205,147,253,46,220,213,99,100,245,185,221,162,33,1,238,225,122,215,250,159,186,65,95,177,113,40,88,169,198,68,136,132,8,8,0,0,64,24,164,13,215,171,155,169,48,182,158,172,2,28,143,88,42,255,224,40,88,1,241,121,248,245,15,32,64,55,164,111,64,23,23,2,175,158,175,1,24,180,64,28,211,9,178,161,191,5,250,35,20,120,249,83,190,27,0,117,180,131,12,8,162,155,139,68,40,46,44,68,24,88,168,62,25,46,220,215,36,74,93,34,103,3,161,229,145,124,149,33,220,107,247,250,185,29,4,133,205,184,135,235,67,200,175,91,6,189,15,192,187,0,45,80,85,140,88,28,79,0,0,67,131,168,75,72,170,13,73,121,66,30,89,10,71,95,180,215,55,83,104,27,0,244,250,185,117,1,35,192,235,0,192,229,132,4,35,2,122,243,126,16,160,197,208,0,194,91,95,4,255,83,207,141,248,232,68,234,86,146,4,62,103,151,87,208,215,245,62,54,98,193,245,191,178,86,83,119,242,173,203,110,76,118,10,46,99,223,141,179,75,217,221,104,172,27,55,252,191,26,198,242,147,185,72,242,45,17,254,8,110,193,103,25,77,124,164,85,103,186,0,11,42,203,41,124,55,93,205,107,62,164,116,180,86,158,241,193,255,73,56,139,34,60,62,87,2,154,171,139,210,241,136,0,0,144,192,144,216,191,97,50,74,23,171,203,213,174,33,183,223,1,58,140,190,143,217,77,97,44,1,0,221,146,80,0,244,149,15,0,223,95,200,112,227,0,104,0,0,233,42,115,112,3,218,205,21,183,131,117,236,253,230,97,194,189,152,119,175,36,1,221,174,239,101,161,104,89,159,246,49,154,222,45,37,90,214,30,119,34,6,68,178,96,88,179,170,74,213,35,151,24,3,190,8,174,234,123,22,136,7,178,109,209,200,44,23,242,163,169,16,143,221,139,221,49,23,218,225,131,211,39,225,22,192,227,185,3,80,176,82,171,39,66,34,4,0,0,57,1,252,84,177,188,105,71,158,91,25,157,136,237,223,9,128,205,134,139,123,1,243,6,128,212,143,3,0,160,39,245,2,232,139,106,68,192,114,42,0,64,183,102,101,58,2,128,190,54,238,141,216,61,54,105,142,72,27,12,183,122,100,248,186,105,99,228,8,199,171,124,11,140,163,79,195,166,227,52,135,98,187,129,8,6,218,57,20,72,0,126,249,221,162,71,23,66,252,230,67,183,103,248,105,165,92,138,59,249,53,197,100,43,180,13,248,192,39,165,179,40,225,206,93,0,205,149,170,84,74,132,132,4,0,0,224,178,0,38,173,182,63,37,85,242,47,235,187,205,33,145,95,0,134,48,120,211,160,0,3,0,189,125,233,43,1,1,174,19,0,200,125,21,8,172,24,96,238,237,4,64,224,244,128,146,45,3,188,156,190,197,31,115,198,136,97,67,115,154,48,240,18,206,17,73,217,30,26,253,159,3,21,73,68,65,98,193,37,97,33,1,254,200,93,248,119,166,16,175,39,113,76,35,120,12,119,229,217,84,19,31,101,229,108,192,7,251,233,210,39,0,143,247,109,128,230,42,42,149,16,145,136,8,0,0,160,83,47,161,154,196,96,73,115,219,213,65,118,197,216,164,251,29,96,179,254,26,229,219,143,103,30,50,4,0,236,250,27,0,144,158,142,0,192,61,117,31,100,200,82,67,190,53,0,33,109,35,70,123,240,251,74,119,251,105,185,105,0,128,212,216,156,44,61,246,194,163,110,167,52,19,53,32,65,32,129,177,96,128,32,0,190,200,93,148,119,20,241,186,41,115,26,130,71,238,66,188,74,117,245,154,149,180,37,39,92,124,176,157,75,221,0,30,18,16,21,224,106,53,33,70,68,2,0,128,150,219,200,244,37,115,55,237,116,241,233,113,86,174,227,142,192,12,167,231,211,96,206,131,7,131,12,0,87,31,79,183,2,45,144,59,103,64,247,153,44,92,68,49,243,54,86,2,220,60,136,72,77,0,240,202,157,161,78,168,100,111,62,13,107,6,242,200,85,224,127,243,96,22,1,22,97,5,117,92,68,4,46,11,2,148,136,56,0,30,201,221,185,119,245,16,175,221,211,102,88,16,201,221,209,171,137,80,215,184,212,178,135,37,100,124,240,116,110,116,2,120,232,2,8,227,159,48,97,68,36,2,0,252,18,97,127,157,207,145,102,230,179,186,27,172,155,204,0,158,38,156,142,188,236,8,220,6,192,183,213,51,1,36,232,167,1,186,133,249,1,199,28,56,41,67,192,121,68,70,81,156,108,204,99,198,16,140,78,101,184,195,88,155,14,176,14,28,200,15,22,175,21,9,211,64,36,32,192,224,162,34,98,1,30,200,237,193,171,237,46,94,237,210,143,105,32,147,200,93,172,231,108,150,90,238,135,56,182,146,4,62,208,106,44,192,221,150,128,132,179,101,36,68,68,68,4,0,128,242,33,192,234,239,70,161,229,129,187,58,159,85,140,108,160,63,93,161,106,89,22,210,124,7,0,90,234,126,1,128,188,1,27,224,211,71,137,203,151,4,148,247,220,19,22,182,155,62,88,103,203,90,179,40,63,162,29,216,250,191,130,117,234,132,89,92,8,33,68,110,164,32,68,16,112,113,185,0,158,200,157,184,119,90,137,11,121,204,208,107,49,143,220,149,120,69,187,90,26,230,214,40,142,241,7,160,21,253,49,204,3,3,4,239,41,0,205,179,74,197,72,132,136,72,0,64,239,85,150,254,188,135,45,63,63,128,128,193,19,250,10,183,181,96,1,0,82,219,162,64,128,171,120,0,162,169,129,65,32,32,157,31,232,156,141,235,0,114,179,130,102,144,46,97,220,42,33,48,184,37,2,89,125,27,96,111,132,139,50,112,69,92,68,16,96,32,48,96,40,0,62,200,157,249,199,204,184,122,77,234,222,70,112,200,61,185,219,92,10,117,221,244,123,11,2,31,184,210,1,224,161,6,140,76,241,85,36,34,36,36,2,0,128,7,0,227,238,167,159,219,46,61,46,104,44,73,202,159,24,186,23,248,245,166,52,167,148,54,0,216,65,11,104,64,50,105,1,112,95,91,230,192,170,215,230,40,23,24,185,14,35,5,97,219,22,64,130,52,175,52,7,114,247,160,93,204,94,200,118,217,12,207,175,115,131,10,31,40,42,4,48,44,184,40,112,1,30,201,61,193,99,69,169,79,29,115,135,5,135,220,153,123,54,173,212,195,34,143,237,144,157,240,129,73,45,128,67,148,43,142,74,69,66,34,68,66,0,0,248,46,82,43,115,254,251,185,214,128,185,11,119,164,192,1,0,153,99,202,171,111,153,1,148,178,5,32,96,229,1,192,206,132,40,50,206,82,9,0,232,4,130,33,53,205,5,144,172,142,107,44,21,6,198,93,133,96,127,106,67,255,208,28,12,119,64,193,130,68,129,66,181,176,0,254,200,221,209,179,171,170,207,66,60,59,252,57,172,20,114,87,235,94,134,171,23,186,185,141,130,9,31,104,210,45,128,199,59,1,97,112,141,82,18,18,33,34,33,1,0,64,172,64,230,166,181,81,201,56,168,234,97,109,227,92,5,224,74,39,239,53,128,0,128,30,45,3,168,240,156,81,33,73,218,131,8,43,130,84,182,39,128,233,224,118,219,16,60,149,48,96,104,172,229,134,41,216,174,129,246,69,98,172,115,162,12,112,169,112,25,10,36,80,18,0,158,200,221,18,183,170,161,94,94,250,185,129,68,238,169,222,218,222,212,213,86,203,216,128,15,86,58,11,240,152,4,24,191,98,145,16,17,137,16,0,0,89,79,8,190,118,251,21,246,141,37,79,171,33,180,82,3,12,205,46,56,48,128,1,64,246,215,21,104,113,40,208,175,14,171,14,1,70,42,192,244,39,220,218,48,24,35,80,242,145,91,169,179,151,13,172,40,172,247,16,162,191,2,42,211,4,36,32,18,24,48,32,70,0,190,200,221,42,183,94,77,93,165,83,247,118,184,224,145,187,131,87,35,110,177,52,170,185,178,6,31,144,110,1,220,77,2,226,154,43,21,145,16,17,17,17,0,0,20,215,32,102,35,195,103,101,143,87,250,86,11,186,106,39,245,0,106,241,249,170,107,0,0,224,11,170,1,37,72,74,4,128,56,6,10,110,126,86,102,205,8,112,169,24,0,112,25,139,55,238,83,51,12,90,180,225,132,136,21,203,167,129,97,32,12,252,2,227,179,133,133,68,128,194,130,5,34,170,5,94,201,125,18,215,61,154,90,210,34,206,29,58,99,5,22,185,55,238,82,85,213,149,86,249,108,137,9,225,58,139,132,167,44,234,0,32,231,124,69,136,68,136,132,8,0,56,104,177,34,161,38,205,129,1,203,251,18,0,0,0,201,139,108,180,145,255,55,254,203,153,118,127,92,2,180,248,50,178,95,202,237,181,37,226,123,30,19,222,86,99,168,4,151,244,192,131,106,136,117,36,100,169,169,159,32,126,37,160,191,225,124,88,184,17,24,3,68,21,92,21,88,222,200,61,232,35,98,170,213,37,205,173,93,195,35,247,130,111,241,80,244,242,189,135,91,146,140,15,246,86,237,1,120,74,158,72,0,172,149,42,19,17,17,34,18,0,0,40,237,64,94,75,135,37,68,251,80,116,163,84,81,104,105,11,160,141,235,170,110,4,0,32,155,123,43,80,232,16,57,45,212,254,112,127,253,8,240,209,228,15,211,25,201,176,157,113,75,49,155,53,0,192,85,41,185,45,143,234,102,240,52,236,4,12,112,93,36,36,32,98,145,112,13,0,190,200,61,197,189,218,169,94,153,101,238,166,150,9,18,185,91,226,214,208,21,244,99,27,129,63,4,72,87,239,145,159,91,35,216,0,119,155,128,152,191,74,136,136,132,136,4,0,208,26,76,162,159,108,232,102,254,21,39,6,132,25,126,50,101,0,0,32,23,219,3,18,172,190,8,0,88,167,80,144,18,64,154,13,99,95,160,38,33,119,89,183,179,24,127,74,45,1,1,6,82,13,126,142,5,21,21,17,5,46,42,44,136,8,84,184,30,201,189,136,251,104,71,173,117,101,238,166,178,196,224,144,123,16,215,213,150,250,180,176,183,34,240,193,169,15,15,192,221,38,192,249,74,39,68,68,34,36,4,0,128,79,36,186,252,62,148,252,43,113,255,156,60,133,79,103,100,176,205,241,55,116,4,88,96,81,209,122,128,34,70,0,52,96,20,249,51,11,185,222,80,255,12,238,51,101,237,247,151,216,42,1,3,187,41,158,90,79,12,160,17,2,1,3,186,65,116,65,37,194,98,113,129,139,152,0,62,200,157,209,179,213,93,64,52,135,215,176,200,221,130,91,33,166,122,12,140,13,248,192,134,27,1,238,22,32,202,57,175,18,34,34,33,18,33,0,64,35,149,228,219,230,13,63,175,56,186,10,23,58,56,96,51,129,192,195,142,230,206,21,0,200,0,232,94,37,0,227,206,78,61,64,151,224,169,32,156,168,13,189,141,71,0,169,132,133,242,211,5,115,124,74,38,165,133,18,0,240,1,35,224,224,2,198,2,198,130,133,129,2,21,81,1,30,201,189,225,91,177,47,37,47,204,13,124,114,191,253,165,141,174,164,206,50,182,139,10,73,113,45,192,166,181,122,34,34,68,34,34,0,128,211,179,106,112,51,43,143,70,75,234,136,26,86,25,79,158,157,198,111,91,50,133,27,17,167,92,250,150,24,10,208,71,199,20,59,82,157,0,64,84,6,2,64,3,192,68,107,6,12,234,33,238,114,105,83,115,119,222,164,182,155,64,232,156,141,4,132,9,197,212,64,45,32,64,185,88,160,162,18,25,0,126,201,189,177,71,19,71,25,65,216,219,36,101,213,251,61,222,26,115,43,200,182,67,43,198,117,31,9,15,53,192,153,74,19,17,32,34,68,68,2,47,111,202,117,12,167,9,233,28,245,208,124,58,242,5,24,192,136,69,247,63,199,123,59,215,241,226,121,174,176,241,224,110,119,85,1,221,161,198,8,185,169,14,2,81,202,228,238,2,128,6,130,221,182,158,191,126,26,89,26,150,204,6,133,11,90,240,38,194,194,37,128,2,5,35,1,139,139,245,3,190,201,125,139,91,27,159,210,232,237,1,152,253,254,41,219,136,87,24,112,0,247,22,240,52,1,3,131,157,115,97,250,132,72,128,144,136,0,1,236,146,200,58,23,109,166,232,58,91,184,20,139,170,193,181,237,183,35,247,31,245,193,31,141,162,197,202,107,26,113,48,187,184,25,162,17,0,239,34,195,122,77,160,179,22,4,132,41,5,187,50,73,246,24,76,39,66,80,235,160,9,5,6,146,8,130,5,131,10,23,17,1,46,36,30,202,253,197,182,105,93,105,29,115,75,197,203,173,120,179,227,26,113,11,3,206,4,220,104,61,1,232,8,118,181,162,72,0,0,0,0,64,0,0,120,175,96,75,230,131,43,12,62,53,160,94,138,217,254,248,134,213,60,190,197,243,44,226,66,180,5,26,5,32,24,180,39,0,135,55,139,225,89,194,129,189,9,221,55,210,139,16,129,49,101,242,246,237,58,63,148,130,27,224,138,32,0,158,201,253,194,219,136,163,140,224,178,29,70,82,86,193,191,205,182,169,71,17,44,142,3,145,113,79,50,5,227,227,86,0,176,195,112,53,18,33,64,34,64,0,0,0,68,218,224,76,158,254,178,35,61,83,177,140,168,6,236,215,3,158,65,27,136,74,65,23,4,17,33,129,56,52,165,72,99,136,64,114,4,172,147,177,104,34,241,147,149,167,241,174,157,237,6,85,169,159,139,123,193,138,40,80,65,138,176,8,0,126,201,253,1,71,219,67,176,232,230,150,200,77,170,247,143,222,54,209,149,89,244,99,155,194,197,141,126,179,1,1,240,144,128,230,166,60,34,34,18,18,2,0,192,117,247,6,138,190,189,81,21,167,115,27,132,44,0,139,97,190,15,163,171,81,92,223,243,101,141,242,123,56,223,41,104,11,234,23,128,41,20,72,68,77,15,2,90,0,128,221,238,80,96,36,141,56,79,100,18,2,212,71,170,19,247,12,10,74,0,2,10,21,74,128,133,1,1,126,201,253,194,103,25,75,45,229,194,54,46,76,171,119,115,119,164,31,161,92,216,67,11,184,55,64,62,141,22,0,120,72,32,175,18,32,36,34,4,132,0,0,128,104,229,20,202,86,215,81,163,41,57,93,114,119,220,32,155,229,7,106,192,0,128,118,115,6,4,53,23,220,143,144,98,6,68,167,160,120,192,245,11,217,240,235,16,64,78,150,122,24,7,222,138,166,83,148,10,168,21,68,17,20,11,136,168,62,201,253,130,123,85,87,151,75,221,155,224,177,218,253,71,110,15,165,52,150,177,13,130,138,27,30,1,9,146,187,77,64,195,37,78,68,132,136,136,4,8,40,240,92,197,34,99,111,24,40,65,8,0,0,200,62,103,241,97,56,117,150,28,30,28,31,237,5,85,75,128,129,242,132,7,92,29,113,18,204,73,66,233,124,6,148,233,186,172,64,194,19,248,252,88,245,131,4,7,225,24,128,43,194,165,18,128,136,155,128,139,0,62,201,253,4,71,51,187,98,161,109,73,94,74,185,155,187,35,125,87,116,58,219,165,2,224,70,62,19,64,32,113,40,190,34,36,36,66,34,68,2,0,184,127,171,128,143,97,3,186,131,216,60,92,76,22,61,20,177,143,129,126,243,12,52,160,171,205,174,77,36,10,224,50,13,192,63,87,84,75,1,201,213,27,214,57,222,216,129,113,15,117,16,251,84,0,160,162,49,16,3,88,80,49,144,46,176,176,112,69,0,30,201,253,194,123,209,66,173,94,250,177,101,150,155,81,238,191,122,207,189,43,30,46,27,112,181,0,238,22,160,170,35,17,17,18,18,17,0,160,215,154,42,193,114,128,128,2,169,154,20,73,182,17,0,204,207,38,52,38,191,137,30,187,37,162,32,169,57,67,128,171,115,128,59,253,120,151,122,125,126,157,193,248,50,160,253,44,73,154,89,74,183,153,11,199,106,220,25,11,184,1,2,1,11,24,168,18,17,2,88,158,201,253,133,143,178,118,101,68,47,27,40,229,254,39,246,212,174,204,236,101,3,174,3,192,187,1,132,171,19,17,18,17,18,2,0,130,13,202,6,91,2,212,87,235,184,151,128,65,0,64,243,19,143,70,179,249,209,23,42,246,49,17,160,85,157,40,39,207,129,136,66,215,1,120,82,142,1,18,64,234,135,124,195,10,198,252,142,254,87,92,240,29,151,5,210,0,34,110,5,67,128,2,21,79,103,103,83,0,4,66,176,0,0,0,0,0,0,153,38,0,0,3,0,0,0,155,234,100,217,11,102,111,107,107,105,100,108,113,118,112,94,190,201,253,49,71,227,75,45,131,216,182,197,205,39,119,115,179,199,151,242,190,44,54,224,179,64,0,235,208,156,201,0,145,144,0,18,18,2,0,176,218,35,185,232,60,245,238,13,241,98,170,174,100,79,98,8,114,171,239,241,91,185,9,4,160,54,203,2,164,64,165,169,1,230,107,16,140,85,130,89,35,202,65,40,96,21,160,41,45,185,10,1,46,145,4,11,36,162,10,132,139,11,94,201,253,16,219,180,87,245,88,108,173,45,38,146,251,69,247,178,31,97,179,216,134,193,149,8,210,161,225,60,33,33,18,17,34,33,1,144,92,75,224,188,213,110,177,128,181,54,227,182,157,178,253,131,221,213,232,232,41,155,70,239,189,246,12,109,9,33,118,125,175,34,160,188,114,33,64,164,17,24,110,81,16,91,4,88,77,106,37,164,199,2,132,68,147,130,36,79,129,65,2,129,0,67,130,8,10,145,193,128,1,158,201,253,49,71,244,86,54,209,54,144,32,146,251,193,246,182,30,229,38,218,70,18,184,241,68,66,0,90,30,83,3,70,62,17,18,18,18,34,33,1,0,242,253,176,157,189,99,176,191,175,195,172,135,1,0,32,6,152,168,175,14,245,195,45,140,109,146,27,0,69,178,89,7,128,73,93,25,96,68,224,148,37,192,125,198,108,105,85,50,33,195,219,62,154,6,12,44,6,23,4,9,42,23,23,4,23,126,201,253,145,71,98,87,70,135,45,195,0,153,220,191,122,13,75,105,157,222,30,222,8,240,25,224,78,128,199,84,128,130,243,132,68,68,136,72,68,0,0,164,81,222,228,49,157,76,248,173,60,21,180,33,178,156,213,128,205,193,177,19,0,0,128,244,48,2,8,236,134,1,235,48,67,4,36,179,128,93,60,148,212,94,80,122,117,4,68,212,70,10,129,171,0,5,11,193,128,138,43,129,138,4,145,5,30,201,253,22,107,218,82,189,15,151,173,141,84,38,185,63,108,141,56,74,91,172,246,48,240,25,224,11,192,157,4,36,92,19,34,33,33,18,18,34,0,0,57,108,155,5,97,182,137,164,247,88,33,133,225,104,216,15,0,226,244,25,135,24,0,64,157,171,12,200,216,167,65,39,153,137,60,5,217,20,16,167,209,61,35,2,11,213,1,136,208,253,161,0,209,101,65,129,2,37,64,36,66,98,0,30,201,253,150,107,225,75,45,170,106,155,100,42,185,63,116,77,220,74,129,61,4,92,119,3,60,36,192,225,18,1,18,33,17,34,34,1,0,24,104,83,11,23,202,96,193,170,150,144,1,0,96,158,145,47,162,210,244,71,171,54,60,206,1,232,80,182,72,174,37,224,8,33,94,84,106,19,224,174,116,156,214,4,35,203,124,79,191,0,241,130,197,37,1,151,229,2,149,136,11,254,200,253,166,107,234,86,218,138,13,76,114,127,244,146,122,20,11,54,224,250,2,240,216,4,20,87,124,64,68,72,136,132,8,0,56,62,87,232,8,68,131,62,1,57,115,177,1,100,32,0,128,81,222,118,141,243,24,31,127,187,17,91,122,223,236,0,10,226,175,0,110,214,208,121,145,160,233,129,129,38,97,87,176,234,94,214,13,128,37,113,39,77,172,212,52,96,14,34,98,66,68,133,128,136,8,138,5,158,200,253,192,107,233,183,34,138,182,51,13,141,220,111,177,36,142,162,211,219,206,25,124,30,12,159,33,224,241,36,192,184,226,35,17,34,34,18,2,0,0,4,127,75,245,252,239,185,249,244,68,163,129,162,146,45,122,132,203,200,96,243,124,115,14,4,24,128,93,119,155,2,192,105,248,39,218,117,100,210,52,137,51,16,166,4,65,201,21,113,115,0,71,146,242,61,121,149,150,195,184,32,185,8,64,84,88,88,160,82,97,0,222,200,253,138,107,213,91,45,245,37,219,43,67,208,200,253,203,122,60,148,242,176,216,14,7,21,215,13,0,119,219,0,26,150,44,64,68,68,68,66,66,0,192,234,105,238,97,18,169,218,138,26,4,74,118,9,25,11,0,160,255,122,111,220,249,183,163,163,55,28,255,83,34,85,65,107,64,2,52,2,128,172,169,98,39,212,26,155,10,230,40,128,156,30,226,39,147,66,246,116,7,70,151,159,100,152,6,49,98,161,2,11,33,130,130,161,162,0,62,200,125,136,61,254,40,232,109,19,76,114,127,153,53,109,87,202,130,45,96,112,221,2,120,108,9,136,242,74,17,18,17,18,18,18,0,0,124,61,171,172,84,168,49,28,66,181,108,167,15,67,36,1,128,32,254,56,118,235,250,206,203,55,241,244,126,101,149,215,23,32,177,7,215,215,117,0,116,73,112,3,130,92,231,65,236,231,221,10,22,112,37,165,28,94,21,0,8,138,168,162,26,32,18,65,197,18,65,193,144,0,94,200,253,59,151,59,83,0,55,144,200,253,231,152,246,106,130,30,183,36,240,161,235,199,195,153,63,215,7,176,41,12,0,0,0,0,0,0,0,0,0,0,0,244,54,211,50,248,219,23,223,63,121,156,158,189,154,29,184,190,156,71,181,168,167,142,238,207,182,76,56,121,241,66,210,104,52,26,253,118,195,205,57,203,101,149,115,98,130,147,14,235,163,3];

    //Dance Of The Sugar Plum Fairy - first half of the second bar (from https://commons.wikimedia.org/wiki/File:Dance_of_the_Sugar_Plum_Fairies_(ISRC_USUAN1100270).oga)
    var dspf3 = [79,103,103,83,0,2,0,0,0,0,0,0,0,0,248,38,0,0,0,0,0,0,42,117,160,241,1,30,1,118,111,114,98,105,115,0,0,0,0,2,68,172,0,0,0,0,0,0,0,250,0,0,0,0,0,0,184,1,79,103,103,83,0,0,0,0,0,0,0,0,0,0,248,38,0,0,1,0,0,0,43,242,72,61,16,59,255,255,255,255,255,255,255,255,255,255,255,255,255,255,193,3,118,111,114,98,105,115,43,0,0,0,88,105,112,104,46,79,114,103,32,108,105,98,86,111,114,98,105,115,32,73,32,50,48,49,50,48,50,48,51,32,40,79,109,110,105,112,114,101,115,101,110,116,41,0,0,0,0,1,5,118,111,114,98,105,115,33,66,67,86,1,0,0,1,0,24,99,84,41,70,153,82,210,74,137,25,115,148,49,70,153,98,146,74,137,165,132,22,66,72,157,115,20,83,169,57,215,156,107,172,185,181,32,132,16,26,83,80,41,5,153,82,142,82,105,25,99,144,41,5,153,82,16,75,73,37,116,18,58,39,157,99,16,91,73,193,214,152,107,139,65,182,28,132,13,154,82,76,41,196,148,82,138,66,8,25,83,140,41,197,148,82,74,66,7,37,116,14,58,230,28,83,142,74,40,65,184,156,115,171,181,150,150,99,139,169,116,146,74,231,36,100,76,66,72,41,133,146,74,7,165,83,78,66,72,53,150,214,82,41,29,115,82,82,106,65,232,32,132,16,66,182,32,132,13,130,208,144,85,0,0,1,0,192,64,16,26,178,10,0,80,0,0,16,138,161,24,138,2,132,134,172,2,0,50,0,0,4,160,40,142,226,40,142,35,57,146,99,73,22,16,26,178,10,0,0,2,0,16,0,0,192,112,20,73,145,20,201,177,36,75,210,44,75,211,68,81,85,125,213,54,85,85,246,117,93,215,117,93,215,117,32,52,100,21,0,0,1,0,64,72,167,153,165,26,32,194,12,100,24,8,13,89,5,0,32,0,0,0,70,40,194,16,3,66,67,86,1,0,0,1,0,0,98,40,57,136,38,180,230,124,115,142,131,102,57,104,42,197,230,116,112,34,213,230,73,110,42,230,230,156,115,206,57,39,155,115,198,56,231,156,115,138,114,102,49,104,38,180,230,156,115,18,131,102,41,104,38,180,230,156,115,158,196,230,65,107,170,180,230,156,115,198,57,167,131,113,70,24,231,156,115,154,180,230,65,106,54,214,230,156,115,22,180,166,57,106,46,197,230,156,115,34,229,230,73,109,46,213,230,156,115,206,57,231,156,115,206,57,231,156,115,170,23,167,115,112,78,56,231,156,115,162,246,230,90,110,66,23,231,156,115,62,25,167,123,115,66,56,231,156,115,206,57,231,156,115,206,57,231,156,115,130,208,144,85,0,0,16,0,0,65,24,54,134,113,167,32,72,159,163,129,24,69,136,105,200,164,7,221,163,195,36,104,12,114,10,169,71,163,163,145,82,234,32,148,84,198,73,41,157,32,52,100,21,0,0,8,0,0,33,132,20,82,72,33,133,20,82,72,33,133,20,82,136,33,134,24,98,200,41,167,156,130,10,42,169,164,162,138,50,202,44,179,204,50,203,44,179,204,50,235,176,179,206,58,236,48,196,16,67,12,173,180,18,75,77,181,213,88,99,173,185,231,156,107,14,210,90,105,173,181,214,74,41,165,148,82,74,41,8,13,89,5,0,128,0,0,16,8,25,100,144,65,70,33,133,20,82,136,33,166,156,114,202,41,168,160,2,66,67,86,1,0,128,0,0,2,0,0,0,60,201,115,68,71,116,68,71,116,68,71,116,68,71,116,68,199,115,60,71,148,68,73,148,68,73,180,76,203,212,76,79,21,85,213,149,93,91,214,101,221,246,109,97,23,118,221,247,117,223,247,117,227,215,133,97,89,150,101,89,150,101,89,150,101,89,150,101,89,150,101,89,130,208,144,85,0,0,8,0,0,128,16,66,8,33,133,20,82,72,33,165,24,99,204,49,231,160,147,80,66,32,52,100,21,0,0,8,0,32,0,0,0,192,81,28,197,113,36,71,114,36,201,146,44,73,147,52,75,179,60,205,211,60,77,244,68,81,20,77,211,84,69,87,116,69,221,180,69,217,148,77,215,116,77,217,116,85,89,181,93,89,182,109,217,214,109,95,150,109,223,247,125,223,247,125,223,247,125,223,247,125,223,247,117,29,8,13,89,5,0,72,0,0,232,72,142,164,72,138,164,72,142,227,56,146,36,1,161,33,171,0,0,25,0,0,1,0,40,138,163,56,142,227,72,146,36,73,150,164,73,158,229,89,162,102,106,166,103,122,170,168,2,161,33,171,0,0,64,0,0,1,0,0,0,0,0,40,154,226,41,166,226,41,162,226,57,162,35,74,162,101,90,162,166,106,174,40,155,178,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,46,16,26,178,10,0,144,0,0,208,145,28,201,145,28,73,145,20,73,145,28,201,1,66,67,86,1,0,50,0,0,2,0,112,12,199,144,20,201,177,44,75,211,60,205,211,60,77,244,68,79,244,76,79,21,93,209,5,66,67,86,1,0,128,0,0,2,0,0,0,0,0,48,36,195,82,44,71,115,52,73,148,84,75,181,84,77,181,84,75,21,85,79,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,53,77,211,52,77,32,52,100,37,0,16,5,0,0,58,75,45,214,218,43,128,148,130,86,131,104,16,100,16,115,239,144,83,78,98,16,162,98,204,65,204,65,117,16,66,105,189,199,204,49,6,173,230,88,49,132,152,196,88,51,135,20,131,210,2,161,33,43,4,128,208,12,0,131,36,1,146,166,1,146,166,1,0,0,0,0,0,0,128,228,105,128,38,138,128,38,138,0,0,0,0,0,0,0,32,105,26,160,137,34,160,137,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,146,166,1,158,41,2,154,40,2,0,0,0,0,0,0,128,38,138,128,104,170,128,168,154,0,0,0,0,0,0,0,160,137,34,32,170,34,32,154,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,146,166,1,154,40,2,158,40,2,0,0,0,0,0,0,128,38,138,128,168,154,128,40,170,0,0,0,0,0,0,0,160,137,38,32,154,42,32,170,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,128,0,7,0,128,0,11,161,208,144,21,1,64,156,0,128,193,113,44,11,0,0,28,73,210,44,0,0,112,36,75,211,0,0,192,210,52,81,4,0,0,75,211,68,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,192,128,3,0,64,128,9,101,160,208,144,149,0,64,20,0,128,65,49,60,13,96,89,0,203,2,104,26,64,211,0,158,7,240,60,128,40,2,0,1,0,0,5,14,0,0,1,54,104,74,44,14,80,104,200,74,0,32,10,0,192,160,40,150,101,89,158,7,77,211,52,81,132,166,105,154,40,66,211,52,79,20,161,105,154,38,138,16,69,207,51,77,120,162,231,153,38,76,83,20,77,19,136,162,105,10,0,0,40,112,0,0,8,176,65,83,98,113,128,66,67,86,2,0,33,1,0,6,71,177,44,79,243,60,207,19,69,211,84,85,104,154,231,137,162,40,138,166,105,170,42,52,205,243,68,81,20,77,211,52,85,21,154,230,121,162,40,138,166,169,170,170,10,77,243,60,81,20,69,211,84,85,85,133,231,137,162,40,154,166,105,170,170,235,194,243,68,81,20,77,211,52,85,213,117,33,138,162,104,154,166,169,170,170,235,186,64,20,77,211,52,85,85,85,93,23,136,162,105,154,166,170,186,174,44,3,81,52,77,211,84,85,215,149,101,96,154,170,170,170,170,235,186,178,12,80,77,85,85,85,215,149,101,128,170,186,170,235,186,174,44,3,84,85,117,93,215,149,101,25,224,186,174,235,202,178,108,219,0,92,215,117,101,217,182,5,0,0,28,56,0,0,4,24,65,39,25,85,22,97,163,9,23,30,128,66,67,86,4,0,81,0,0,128,49,76,41,166,148,97,76,66,40,33,52,138,73,8,41,132,76,74,74,169,149,84,65,72,37,165,82,42,8,169,164,84,74,70,165,165,148,82,202,32,148,82,82,42,21,132,84,74,42,165,0,0,176,3,7,0,176,3,11,161,208,144,149,0,64,30,0,0,65,136,82,140,49,198,156,148,82,41,198,156,115,78,74,169,20,99,206,57,39,165,100,140,49,231,156,147,82,50,198,152,115,206,73,41,29,115,206,57,231,164,148,140,57,231,156,115,82,74,231,156,115,206,57,41,165,148,206,57,231,156,148,82,74,8,157,115,78,74,41,165,115,206,57,39,0,0,168,192,1,0,32,192,70,145,205,9,70,130,10,13,89,9,0,164,2,0,24,28,199,178,52,77,211,60,79,20,53,73,210,52,207,243,60,81,52,77,77,178,52,205,243,60,79,20,77,147,231,121,158,40,138,162,105,170,42,207,243,60,81,20,69,211,84,85,174,43,138,166,105,154,170,170,170,100,89,20,69,209,52,85,85,117,97,154,166,169,170,170,234,186,48,77,81,84,85,213,117,93,200,178,105,170,170,235,202,50,108,219,52,85,213,117,101,25,168,170,170,202,174,44,3,215,85,85,215,149,101,1,0,224,9,14,0,64,5,54,172,142,112,82,52,22,88,104,200,74,0,32,3,0,128,32,4,33,165,20,66,74,41,132,148,82,8,41,165,16,18,0,0,48,224,0,0,16,96,66,25,40,52,100,69,0,16,39,0,0,32,36,165,130,78,74,37,161,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,147,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,146,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,73,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,10,0,208,141,112,0,208,125,48,161,12,20,26,178,18,0,72,5,0,0,140,81,138,49,8,169,197,86,33,196,152,115,18,90,107,173,66,136,49,231,36,180,148,98,207,152,115,16,74,105,45,182,158,49,199,32,148,146,90,139,189,148,206,73,73,173,181,24,123,42,29,163,146,82,75,49,246,222,75,41,37,165,216,98,236,189,167,144,66,142,45,198,216,123,207,49,165,22,91,171,177,247,94,99,74,177,213,24,99,239,189,247,24,99,171,177,214,222,123,239,49,182,86,107,142,5,0,96,54,56,0,64,36,216,176,58,194,73,209,88,96,161,33,43,1,128,144,0,0,194,24,165,24,99,204,57,231,156,115,78,74,201,24,115,206,65,8,33,132,16,74,41,25,99,204,57,8,33,132,16,66,41,37,99,206,57,7,33,132,80,66,40,165,100,204,57,232,32,132,80,66,40,165,148,206,57,7,29,132,16,66,9,165,148,146,49,231,32,132,16,66,9,165,148,82,58,231,32,132,16,66,40,165,132,84,74,41,157,131,16,66,40,33,132,82,74,73,41,132,16,66,8,161,132,80,82,41,41,133,16,66,8,33,132,80,66,74,37,165,16,66,8,33,132,16,74,72,165,164,148,82,8,33,132,16,66,8,165,148,148,82,10,37,148,16,66,40,161,164,146,74,41,165,132,16,74,8,161,164,84,82,42,169,148,18,66,8,37,132,146,74,74,41,149,84,74,40,33,132,82,0,0,192,129,3,0,64,128,17,116,146,81,101,17,54,154,112,225,1,40,52,100,37,0,16,5,0,0,25,7,29,148,150,27,128,144,114,212,90,135,28,132,20,91,11,145,67,12,90,140,157,114,140,65,74,41,100,144,49,198,164,149,146,66,199,24,164,212,98,75,161,131,20,123,207,185,149,212,2,0,0,32,8,0,8,48,1,4,6,8,10,190,16,2,98,12,0,64,16,34,51,68,66,97,21,44,48,40,131,6,135,121,0,240,0,17,33,17,0,36,38,40,210,46,46,160,203,0,23,116,113,215,129,16,130,16,132,32,22,7,80,64,2,14,78,184,225,137,55,60,225,6,39,232,20,149,58,16,0,0,0,0,128,5,0,120,0,0,64,40,128,136,136,102,174,194,226,2,35,67,99,131,163,195,227,3,68,0,0,0,0,0,176,0,224,3,0,0,9,1,34,34,154,185,10,139,11,140,12,141,13,142,14,143,15,144,0,0,64,0,1,0,0,0,0,16,64,0,2,2,2,0,0,0,0,0,1,0,0,0,2,2,79,103,103,83,0,0,192,131,0,0,0,0,0,0,248,38,0,0,2,0,0,0,84,18,228,35,37,32,32,37,43,138,124,115,160,145,135,142,128,128,126,127,122,123,131,121,124,121,117,120,119,119,123,118,115,109,110,114,120,114,106,114,109,106,4,215,234,61,174,199,70,222,63,245,187,47,158,124,154,9,120,0,102,211,116,233,223,155,83,141,32,236,172,140,32,1,244,214,238,181,189,173,205,234,121,0,15,224,65,159,225,236,106,135,187,65,35,18,83,7,49,27,214,242,40,61,33,84,244,214,75,51,118,108,243,196,83,126,27,176,7,240,249,195,202,218,74,159,136,255,170,221,147,222,4,32,189,249,30,133,114,27,151,188,10,36,215,39,144,187,92,159,188,132,205,126,179,18,27,2,28,6,240,210,124,62,30,238,68,155,151,30,51,117,223,254,254,186,191,72,248,184,227,151,171,193,49,2,250,105,110,202,135,196,21,226,177,183,171,109,79,103,92,58,207,158,255,150,120,79,241,66,222,199,179,196,120,26,185,198,97,217,250,249,159,151,87,39,25,0,30,84,64,11,112,94,41,66,0,0,0,0,0,0,0,240,214,49,45,47,120,121,233,206,124,212,187,6,128,33,105,48,247,170,96,139,4,124,24,236,204,169,86,216,67,180,232,175,45,130,64,146,31,111,2,105,7,77,235,49,0,223,31,136,163,71,17,128,120,47,178,238,53,0,145,203,0,220,155,4,176,48,0,224,244,245,79,103,198,245,2,0,45,140,129,8,158,41,142,252,247,104,37,126,161,59,59,212,253,68,202,230,217,91,223,165,134,184,6,249,158,195,143,134,98,220,131,42,172,247,255,76,189,115,27,192,105,228,226,34,148,34,66,0,8,0,2,0,0,160,33,168,93,207,177,248,46,66,144,139,187,197,83,21,160,249,220,133,29,119,83,181,0,163,47,2,64,128,39,161,0,68,33,64,37,49,1,122,11,1,32,34,191,128,8,172,132,3,89,0,74,195,130,160,67,213,78,155,114,111,15,0,8,164,32,144,24,64,180,0,254,40,118,202,119,227,161,62,80,191,219,90,102,212,92,173,175,244,46,30,147,250,62,97,155,254,98,220,131,214,55,118,255,65,43,24,29,56,11,32,175,38,36,0,144,0,0,0,64,213,169,1,58,131,199,62,108,12,149,119,244,143,153,110,0,221,230,148,75,226,195,32,2,240,245,186,1,160,220,208,153,206,240,79,0,1,253,193,159,197,54,2,232,23,1,232,252,16,216,7,72,231,214,184,251,37,25,96,218,128,128,132,74,194,0,30,9,110,214,103,43,67,172,141,60,183,70,129,200,176,11,94,205,84,117,205,42,206,233,227,12,230,163,123,208,124,160,253,41,137,243,22,176,27,249,106,184,36,196,56,18,0,198,121,44,93,172,108,251,47,173,50,23,180,126,239,252,125,176,30,126,254,131,55,59,108,93,205,69,207,129,116,85,1,16,69,251,252,152,87,2,0,237,22,212,149,198,8,19,148,61,24,39,120,175,53,37,227,243,124,62,137,133,72,169,77,188,25,223,137,167,91,81,221,9,130,96,116,187,191,84,20,192,128,18,170,181,253,245,213,41,108,183,249,248,20,130,210,197,147,35,42,221,80,154,210,56,184,221,70,12,193,213,53,0,94,9,78,252,207,234,33,126,201,114,24,145,248,104,134,18,151,230,162,126,166,84,124,236,94,206,211,193,237,143,31,0,47,61,233,76,9,120,216,7,24,153,226,21,251,136,136,68,0,128,84,31,207,234,163,53,120,142,171,161,182,181,248,51,0,150,55,7,102,50,64,35,0,220,107,27,0,0,191,41,0,232,255,131,15,224,85,38,0,96,30,16,0,226,222,12,22,194,186,119,71,43,6,198,77,36,244,142,251,185,240,107,229,39,140,4,163,21,243,219,224,174,83,223,107,190,123,186,110,39,179,223,23,230,229,116,170,101,80,49,164,121,66,1,3,190,232,77,234,231,84,77,188,70,21,219,30,107,93,147,2,151,228,174,190,203,214,212,99,82,109,179,140,15,116,60,106,74,192,195,222,0,140,90,115,18,67,16,17,17,18,18,1,0,128,2,129,208,239,178,6,64,201,111,134,237,97,71,62,109,3,48,234,144,72,110,58,5,33,0,252,244,249,222,143,0,128,243,139,221,249,4,0,244,83,1,0,92,14,0,232,215,6,0,248,62,2,193,171,179,197,144,244,29,193,248,133,19,0,210,173,27,223,84,1,100,191,230,193,176,85,72,24,224,18,80,144,24,32,1,94,200,141,234,119,81,37,126,205,44,164,233,221,40,92,137,20,79,214,115,58,161,46,139,126,110,7,109,40,227,3,218,166,4,60,57,87,121,229,22,0,205,57,231,138,143,9,9,17,1,0,224,130,148,61,72,103,167,159,125,178,30,230,60,136,215,135,66,157,29,192,232,109,239,62,203,32,0,68,82,247,9,96,144,116,170,14,0,144,110,235,225,158,103,4,68,97,150,149,123,35,0,123,177,34,32,77,0,166,174,18,11,240,148,55,28,199,78,190,131,209,132,54,135,124,132,154,54,204,35,82,137,24,10,16,20,84,92,36,46,112,1,158,200,157,184,119,45,23,143,211,51,166,96,87,34,191,19,247,46,246,80,47,11,123,91,68,184,135,173,24,215,14,59,5,123,133,213,131,10,8,227,97,170,38,66,36,36,0,0,128,236,96,9,14,188,255,153,154,79,228,94,117,174,254,237,57,0,236,161,117,58,85,255,97,70,0,32,183,188,56,139,0,204,0,248,118,160,208,31,136,241,173,74,249,216,214,18,80,112,113,191,9,164,179,131,233,238,173,3,97,37,128,99,163,125,172,23,167,46,34,46,84,144,4,72,16,12,46,0,126,200,109,232,35,162,171,190,145,247,214,184,194,36,119,37,222,101,148,186,6,117,110,91,240,130,8,238,248,6,136,242,188,42,137,16,17,9,17,1,128,97,214,134,90,19,231,62,95,150,54,205,203,166,171,147,29,8,128,163,63,55,122,102,254,128,93,163,156,223,21,216,61,26,0,13,160,140,0,98,66,117,59,200,32,182,186,167,112,55,84,167,140,126,17,56,81,1,210,126,207,153,133,73,4,164,191,62,250,22,235,11,52,235,127,189,199,128,43,145,112,177,80,16,40,136,72,0,190,200,157,136,143,65,19,175,214,100,51,252,142,113,196,44,114,119,254,217,170,16,143,25,24,19,39,124,78,240,189,171,90,138,120,248,239,10,52,55,121,53,18,33,18,33,1,0,192,7,130,204,221,70,203,250,11,195,127,107,154,58,52,129,62,36,16,77,188,102,23,2,0,0,54,57,2,48,178,172,76,0,224,38,96,253,7,24,187,115,89,18,0,252,211,118,150,133,192,237,124,134,85,224,14,0,218,106,155,62,120,19,172,155,25,24,32,214,8,21,11,11,3,202,34,0,94,200,237,196,187,244,41,30,141,100,58,172,161,145,187,147,143,166,84,245,163,163,109,50,49,62,240,181,77,162,196,46,172,201,235,145,144,144,144,136,0,0,173,54,172,97,167,126,47,74,28,107,245,198,239,163,70,183,65,216,60,43,32,59,138,193,95,228,140,104,20,248,118,111,0,200,205,167,3,192,186,27,108,144,202,116,116,69,1,200,183,236,241,220,206,20,140,115,3,140,50,52,164,187,106,6,100,72,133,0,32,161,221,1,207,0,1,117,193,85,32,66,50,160,72,16,1,158,200,93,200,103,169,77,189,68,113,111,23,161,10,145,220,137,252,76,29,213,207,193,216,126,86,216,224,5,17,44,154,171,74,196,24,17,17,17,17,0,208,48,147,83,105,193,6,70,27,83,167,168,211,7,11,57,111,14,100,243,227,180,69,0,176,58,8,0,64,106,16,0,209,180,7,34,72,124,144,118,67,0,34,206,51,187,84,220,245,254,25,3,199,229,1,220,129,35,164,42,187,95,32,254,26,61,104,40,5,129,132,21,129,40,194,80,81,64,85,65,5,126,200,93,137,199,204,75,61,244,194,216,18,134,67,238,196,191,166,217,85,223,22,121,110,189,164,193,11,36,15,106,160,57,175,179,132,132,136,68,4,0,64,46,16,134,110,82,168,36,99,87,119,55,175,210,1,0,88,184,123,213,59,243,182,251,237,151,67,160,124,183,64,5,164,32,245,4,128,59,57,40,230,0,22,81,54,145,58,48,248,95,32,76,63,0,168,15,0,0,154,42,132,81,57,1,200,253,230,193,74,13,217,50,168,8,168,68,20,16,177,4,36,0,190,200,93,217,179,148,83,189,66,150,230,110,42,62,204,80,200,221,249,123,33,155,248,24,84,83,48,248,128,78,54,1,15,19,192,200,57,92,77,68,72,132,132,0,0,240,111,164,38,35,127,57,240,243,60,250,169,94,75,41,75,186,84,6,200,202,142,54,92,146,12,0,144,52,155,0,90,64,55,17,0,172,219,8,134,46,96,206,170,52,195,189,145,102,2,76,92,111,37,37,92,170,81,245,11,97,148,222,205,0,92,251,152,106,137,115,204,54,69,194,47,96,0,73,162,96,129,1,197,32,1,30,201,61,217,35,162,212,75,147,207,14,123,78,2,26,185,59,120,20,184,122,148,40,223,219,165,210,34,124,224,152,222,211,25,112,104,190,58,17,18,18,34,2,0,0,186,208,83,149,253,223,248,7,187,209,71,203,48,13,156,74,6,48,159,231,251,72,118,212,2,232,180,203,25,0,224,203,4,0,66,153,137,12,120,66,178,166,133,102,111,58,165,28,156,6,32,181,128,97,42,227,93,224,101,38,174,237,157,134,61,165,82,128,64,164,130,136,149,192,197,2,190,200,61,224,163,244,82,175,208,137,103,235,4,127,17,145,220,67,60,171,150,90,81,159,219,179,84,124,32,147,0,60,12,160,185,226,213,72,68,72,136,68,0,128,123,88,206,7,129,63,19,78,84,89,19,171,101,178,130,54,0,56,99,178,137,0,1,208,88,110,10,193,192,221,99,3,152,42,88,60,0,6,105,74,0,8,221,184,82,62,15,65,117,21,131,18,187,212,152,188,0,210,196,176,58,143,106,189,104,188,92,255,54,6,6,201,0,170,139,133,1,151,138,0,126,200,29,241,43,177,171,11,185,109,31,88,136,71,238,170,95,241,165,212,40,159,61,254,217,34,124,22,83,153,18,112,192,90,173,38,34,68,68,66,0,0,104,160,134,28,77,233,255,49,247,162,62,174,105,154,149,50,75,43,59,3,232,124,10,29,175,40,32,29,174,2,104,110,125,49,0,200,38,0,0,95,13,72,16,58,237,1,128,25,185,84,12,83,50,119,181,7,220,252,0,185,235,125,68,64,58,133,110,46,68,84,176,20,72,184,20,20,34,68,0,222,200,221,241,163,71,87,43,234,189,173,74,57,228,206,228,179,104,75,173,146,124,182,214,21,124,224,230,203,148,3,220,153,4,226,42,197,68,68,132,136,8,0,128,224,54,84,86,165,213,193,246,244,13,252,221,52,173,167,64,126,159,7,48,12,227,115,42,19,72,0,200,233,128,25,22,29,1,0,233,90,48,70,109,136,226,247,58,0,192,139,200,123,86,157,93,202,78,100,234,54,16,125,33,27,140,103,128,128,203,5,11,23,5,21,1,42,190,200,93,225,179,232,93,209,139,247,182,47,165,144,187,192,199,164,77,9,157,250,220,195,45,174,50,126,8,176,211,39,55,147,128,59,147,64,148,243,79,132,136,132,132,0,0,240,106,84,57,141,215,25,127,47,127,143,143,16,203,62,3,200,42,107,212,87,11,0,0,126,21,128,0,95,37,0,249,29,139,183,0,2,154,194,173,62,136,17,194,188,77,166,165,150,237,37,237,170,245,26,11,111,47,241,80,10,252,98,133,8,46,6,1,2,138,64,130,0,222,200,189,208,91,215,82,125,184,228,123,55,31,181,73,176,25,228,94,149,51,194,149,209,235,246,86,24,188,192,29,220,70,2,99,254,17,9,137,8,17,0,0,68,94,130,241,210,223,201,241,129,210,176,77,235,50,0,0,127,246,246,177,108,28,204,199,50,103,224,171,69,0,96,56,2,0,34,13,106,144,31,236,107,64,148,53,70,132,172,90,107,227,16,132,165,48,138,213,233,96,85,199,192,56,97,176,76,154,64,192,170,72,144,32,17,32,34,1,254,200,189,162,251,232,71,104,60,204,80,87,101,254,184,187,114,41,196,82,235,228,42,91,179,4,126,104,1,35,159,118,52,44,236,38,215,156,248,68,72,132,136,4,0,128,209,5,5,222,73,51,119,57,25,181,141,29,139,24,80,52,99,99,201,209,42,0,160,160,91,28,2,9,154,108,72,195,122,123,70,129,64,224,210,0,160,84,10,0,152,8,32,141,67,166,93,179,255,19,223,115,41,130,128,129,116,47,146,138,139,4,6,92,132,4,17,42,46,94,200,93,137,123,83,83,65,62,59,240,173,128,75,238,3,223,154,190,148,73,183,183,25,188,224,255,152,219,72,160,185,170,78,132,136,132,72,8,0,72,185,234,116,53,159,77,159,108,120,12,21,178,55,176,51,1,128,147,255,226,244,139,217,177,74,38,23,65,236,211,35,201,89,148,197,38,167,2,96,186,195,136,123,36,130,200,92,19,0,40,231,35,229,206,176,118,5,64,51,196,13,11,199,91,172,38,178,225,45,49,17,65,32,65,89,144,64,68,88,96,160,0,94,201,253,136,151,155,97,9,58,171,41,8,90,185,155,93,182,73,83,152,89,63,207,80,214,5,124,198,80,187,18,176,171,188,138,9,9,137,16,17,9,64,185,165,227,179,55,168,18,55,21,202,111,241,147,235,204,179,10,0,67,91,251,119,3,158,79,108,131,22,148,41,27,0,64,227,226,64,125,223,105,203,123,110,105,64,212,3,18,52,75,210,123,127,170,176,179,186,40,152,202,189,69,2,13,184,9,3,88,20,12,9,34,3,34,23,36,168,126,201,125,248,219,156,82,16,239,109,53,54,86,191,95,254,170,40,84,208,217,158,4,159,129,134,10,176,27,235,42,18,17,1,66,34,4,4,208,104,105,200,50,93,81,184,241,1,97,227,40,141,17,140,224,55,14,86,208,67,28,150,154,93,34,32,160,46,235,46,6,0,249,1,0,65,35,102,249,253,99,213,220,179,80,0,64,157,9,12,254,24,97,56,7,96,164,253,65,53,91,145,8,38,16,92,16,40,16,88,42,176,2,88,17,30,202,253,74,183,216,163,148,192,220,110,153,8,106,197,191,167,109,226,19,98,167,115,188,144,69,248,136,229,109,11,128,221,44,43,66,66,2,0,0,2,0,0,0,209,221,34,208,187,61,26,45,61,199,251,184,106,193,61,75,123,119,169,153,119,195,178,143,117,209,42,12,161,40,40,211,68,6,0,135,32,208,94,248,110,165,79,9,236,87,181,158,165,218,63,181,57,66,200,229,60,140,64,33,65,42,64,84,1,158,201,253,208,151,185,63,74,161,179,61,3,106,193,155,221,246,232,46,52,86,123,104,85,198,105,215,156,87,132,68,4,0,0,72,0,0,128,252,59,232,240,244,90,146,239,249,217,142,250,233,129,126,202,234,110,195,217,188,162,122,251,195,252,27,247,157,102,213,170,72,20,136,181,64,128,250,118,69,2,224,104,98,12,31,14,48,181,50,139,76,86,35,153,37,24,247,5,48,39,53,244,128,130,136,69,196,66,162,2,126,201,125,248,219,156,87,65,182,141,32,182,187,89,167,107,232,74,200,242,222,195,109,215,176,226,179,112,176,221,0,119,4,208,28,46,21,18,18,18,34,33,2,0,192,177,174,189,130,188,242,253,39,182,23,159,190,183,61,216,175,223,47,9,168,77,141,83,64,0,28,233,166,72,128,64,86,208,29,0,124,77,64,19,224,241,229,4,146,39,40,209,108,94,204,86,0,31,176,4,0,21,10,84,24,84,168,4,40,42,23,84,4,88,190,201,125,152,71,106,41,133,180,183,37,90,82,187,223,229,154,190,132,216,177,207,216,123,205,152,226,243,64,23,77,71,192,29,1,68,185,92,37,34,34,36,34,4,0,96,61,63,139,149,58,41,233,226,83,184,216,126,154,148,198,104,47,231,99,194,216,33,43,53,101,4,0,16,169,91,6,18,32,85,1,15,248,7,4,128,128,242,23,176,143,149,78,239,11,225,215,48,34,241,37,172,60,96,57,245,91,20,112,49,160,18,112,97,24,40,36,160,98,0,254,200,189,225,235,172,29,165,101,185,237,177,86,213,205,40,247,151,217,166,63,10,86,219,42,248,156,18,181,63,0,119,4,208,121,53,34,33,18,33,1,2,0,10,126,151,44,228,174,90,201,195,246,197,253,79,121,74,176,30,0,216,86,209,241,25,72,2,140,72,122,109,144,48,34,237,24,128,84,7,88,193,196,49,135,172,1,22,242,63,56,55,212,46,30,148,114,24,1,124,109,192,0,215,130,136,128,68,69,0,42,193,5,2,30,201,253,2,123,19,83,105,157,222,6,70,185,127,244,153,42,5,230,198,139,75,0,118,29,174,68,32,34,34,34,34,18,0,192,139,159,186,10,83,20,205,0,140,73,31,181,190,146,232,82,183,73,36,167,122,45,21,0,162,108,10,42,12,25,164,74,55,2,128,83,159,17,116,94,210,47,79,137,71,73,65,217,13,215,122,141,24,174,3,136,11,32,160,12,197,0,146,5,10,139,8,10,87,66,2,158,200,189,136,107,201,174,86,65,106,219,147,146,124,114,63,211,173,250,82,15,148,185,93,210,247,226,18,128,59,3,8,231,143,68,132,136,72,68,0,0,101,218,155,114,166,138,14,0,134,81,233,158,12,8,0,175,61,215,62,185,52,190,99,243,211,175,129,178,42,16,1,240,229,213,0,152,91,224,91,128,132,115,217,141,148,123,112,149,148,168,159,52,111,117,223,229,57,66,107,64,77,65,24,16,144,36,144,2,136,68,2,112,1,30,201,253,148,199,204,238,138,224,97,143,95,136,27,54,185,159,242,210,180,87,193,106,123,26,124,6,106,2,112,40,206,42,68,36,66,34,68,66,4,0,212,191,153,42,214,33,117,44,148,88,90,114,100,198,8,0,72,35,166,252,230,241,89,0,136,73,1,6,78,185,193,137,177,78,124,71,48,112,29,184,38,171,187,49,62,57,255,220,138,16,173,38,14,69,82,47,92,3,42,24,20,9,136,10,18,68,3,5,94,201,125,179,109,227,143,178,137,182,125,248,228,254,209,71,106,87,74,111,177,109,193,13,235,116,128,14,184,205,36,144,156,115,17,132,132,68,132,132,68,0,128,234,235,11,224,91,96,91,44,30,29,10,36,4,116,235,41,218,7,103,97,63,241,213,210,79,3,246,37,41,189,80,173,230,65,2,226,118,225,178,134,64,132,20,96,170,27,6,1,169,103,4,18,71,12,1,184,84,72,24,40,36,24,23,79,103,103,83,0,4,83,172,0,0,0,0,0,0,248,38,0,0,3,0,0,0,105,59,173,114,11,113,112,113,104,104,106,108,108,113,125,40,30,201,253,164,71,244,168,69,143,45,25,34,185,95,108,175,186,212,26,122,189,61,118,9,55,184,4,224,142,4,138,195,156,34,17,17,18,34,33,0,128,209,97,97,36,4,47,85,2,64,78,147,203,135,6,12,192,248,135,249,46,196,201,15,90,15,23,18,160,74,167,8,0,72,65,181,225,214,61,137,8,252,156,149,130,87,223,118,82,72,170,239,230,80,113,230,131,53,221,135,134,2,174,4,138,0,68,18,129,1,3,92,12,190,201,253,165,143,248,174,72,216,46,226,17,80,201,253,116,103,184,21,68,123,248,210,45,184,4,224,142,4,154,231,138,144,144,8,17,137,0,0,32,250,253,217,165,156,166,56,7,200,149,237,180,180,22,0,0,6,58,108,124,244,208,200,190,82,43,92,117,218,0,64,212,197,18,0,227,106,164,112,4,64,99,114,193,103,126,112,239,166,86,167,49,2,185,84,45,48,208,0,7,21,34,85,129,65,64,2,21,174,64,66,5,158,201,253,138,219,248,171,72,178,237,163,128,74,238,71,220,70,60,138,132,237,195,5,46,245,2,15,155,64,180,230,4,144,144,16,145,136,8,0,112,186,218,153,104,45,205,187,127,104,0,135,142,205,183,1,0,64,99,160,183,99,35,70,78,255,217,189,95,130,190,200,14,8,2,220,68,6,122,130,53,122,119,115,170,13,1,32,174,14,135,144,181,86,119,201,174,151,154,160,190,172,16,137,36,24,8,42,8,184,12,144,184,0,62,201,125,155,109,234,85,90,197,182,47,34,146,251,20,103,214,175,232,101,219,139,8,174,13,192,174,202,132,72,136,68,72,132,68,0,60,221,252,105,80,174,109,6,5,96,134,3,159,104,19,49,143,175,95,35,236,14,52,50,43,98,6,144,250,122,128,129,238,30,120,170,181,236,110,41,143,2,232,227,217,116,190,57,49,58,111,250,150,220,49,128,130,18,80,33,17,192,37,162,50,80,80,1,158,200,189,203,109,230,175,86,84,219,26,30,185,47,113,38,94,5,213,182,6,151,0,236,74,159,16,17,137,16,145,16,0,160,124,201,163,178,13,131,150,0,118,59,121,101,245,209,198,107,98,157,28,115,239,211,115,16,4,104,82,28,144,33,154,20,0,156,16,0,80,111,48,160,142,76,239,102,202,74,221,101,181,54,29,223,124,61,160,184,247,35,160,224,34,113,169,32,8,32,96,97,5,0,190,200,125,177,61,124,74,41,216,122,77,0,145,220,79,121,68,111,5,108,11,56,237,70,206,121,66,36,34,68,68,66,0,0,171,165,183,205,86,214,179,225,83,207,122,89,243,245,178,22,230,42,150,186,28,68,147,163,201,246,49,35,0,82,151,5,0,10,200,85,26,0,72,13,146,251,3,200,144,194,192,124,95,179,201,150,3,19,57,37,88,47,163,65,4,214,2,6,34,215,0,42,1,2,23,34,126,200,189,203,51,188,138,136,237,164,66,35,247,211,172,201,30,37,208,217,26,47,248,92,46,217,184,9,137,59,2,8,203,18,33,33,18,17,18,2,0,0,52,254,107,211,216,227,145,244,220,60,148,234,8,198,46,104,175,1,72,161,150,178,94,215,0,0,168,211,202,0,120,174,1,128,155,195,150,233,222,51,251,11,244,167,85,19,35,151,120,243,154,237,96,204,225,162,42,32,138,136,184,112,41,72,84,0,190,200,125,233,35,241,42,50,182,45,12,114,111,114,79,255,20,171,96,59,54,248,252,148,81,153,134,129,77,104,158,16,145,8,137,144,0,0,0,84,164,96,219,247,196,236,218,80,169,231,243,145,250,108,213,142,246,119,4,82,218,24,158,116,218,168,134,35,229,208,31,36,181,232,4,166,75,53,49,221,122,109,196,120,116,181,94,193,32,185,78,40,47,227,41,170,45,211,68,68,1,2,36,42,22,136,88,84,158,200,253,164,235,238,187,82,170,106,235,40,28,22,185,111,125,164,118,5,201,118,229,16,248,156,60,132,171,1,236,194,56,103,20,137,8,16,17,34,0,0,0,251,175,227,58,145,27,143,180,188,196,188,143,157,251,190,238,90,36,145,34,48,75,190,105,210,88,204,64,225,78,149,58,0,82,63,174,107,72,66,251,64,177,253,159,12,107,90,92,183,204,136,41,29,118,240,104,202,77,9,73,5,23,53,160,0,23,3,75,0,23,126,200,125,248,35,253,86,202,37,219,54,208,200,93,219,83,99,66,101,210,108,192,71,161,235,60,220,164,8,187,202,185,2,136,132,68,136,136,0,0,96,182,95,251,157,191,167,205,122,114,177,86,66,170,187,131,252,118,58,241,91,191,118,86,158,198,139,221,80,44,153,96,203,217,204,60,66,131,165,74,93,148,229,24,218,145,51,28,115,155,226,81,226,111,136,237,33,36,139,54,113,248,240,26,240,73,21,225,200,53,22,39,211,29,23,139,132,8,70,1,1,18,214,5,11,126,200,253,119,47,111,186,0,110,160,144,187,249,90,238,116,1,220,128,2,0,0,0,0,0,0,0,0,0,0,0,0,0,64,238,41,188,231,68,0];

    //Dance Of The Sugar Plum Fairy - second half of the second bar (from https://commons.wikimedia.org/wiki/File:Dance_of_the_Sugar_Plum_Fairies_(ISRC_USUAN1100270).oga)
    var dspf4 = [79,103,103,83,0,2,0,0,0,0,0,0,0,0,70,39,0,0,0,0,0,0,48,86,238,148,1,30,1,118,111,114,98,105,115,0,0,0,0,2,68,172,0,0,0,0,0,0,0,250,0,0,0,0,0,0,184,1,79,103,103,83,0,0,0,0,0,0,0,0,0,0,70,39,0,0,1,0,0,0,82,197,33,72,16,59,255,255,255,255,255,255,255,255,255,255,255,255,255,255,193,3,118,111,114,98,105,115,43,0,0,0,88,105,112,104,46,79,114,103,32,108,105,98,86,111,114,98,105,115,32,73,32,50,48,49,50,48,50,48,51,32,40,79,109,110,105,112,114,101,115,101,110,116,41,0,0,0,0,1,5,118,111,114,98,105,115,33,66,67,86,1,0,0,1,0,24,99,84,41,70,153,82,210,74,137,25,115,148,49,70,153,98,146,74,137,165,132,22,66,72,157,115,20,83,169,57,215,156,107,172,185,181,32,132,16,26,83,80,41,5,153,82,142,82,105,25,99,144,41,5,153,82,16,75,73,37,116,18,58,39,157,99,16,91,73,193,214,152,107,139,65,182,28,132,13,154,82,76,41,196,148,82,138,66,8,25,83,140,41,197,148,82,74,66,7,37,116,14,58,230,28,83,142,74,40,65,184,156,115,171,181,150,150,99,139,169,116,146,74,231,36,100,76,66,72,41,133,146,74,7,165,83,78,66,72,53,150,214,82,41,29,115,82,82,106,65,232,32,132,16,66,182,32,132,13,130,208,144,85,0,0,1,0,192,64,16,26,178,10,0,80,0,0,16,138,161,24,138,2,132,134,172,2,0,50,0,0,4,160,40,142,226,40,142,35,57,146,99,73,22,16,26,178,10,0,0,2,0,16,0,0,192,112,20,73,145,20,201,177,36,75,210,44,75,211,68,81,85,125,213,54,85,85,246,117,93,215,117,93,215,117,32,52,100,21,0,0,1,0,64,72,167,153,165,26,32,194,12,100,24,8,13,89,5,0,32,0,0,0,70,40,194,16,3,66,67,86,1,0,0,1,0,0,98,40,57,136,38,180,230,124,115,142,131,102,57,104,42,197,230,116,112,34,213,230,73,110,42,230,230,156,115,206,57,39,155,115,198,56,231,156,115,138,114,102,49,104,38,180,230,156,115,18,131,102,41,104,38,180,230,156,115,158,196,230,65,107,170,180,230,156,115,198,57,167,131,113,70,24,231,156,115,154,180,230,65,106,54,214,230,156,115,22,180,166,57,106,46,197,230,156,115,34,229,230,73,109,46,213,230,156,115,206,57,231,156,115,206,57,231,156,115,170,23,167,115,112,78,56,231,156,115,162,246,230,90,110,66,23,231,156,115,62,25,167,123,115,66,56,231,156,115,206,57,231,156,115,206,57,231,156,115,130,208,144,85,0,0,16,0,0,65,24,54,134,113,167,32,72,159,163,129,24,69,136,105,200,164,7,221,163,195,36,104,12,114,10,169,71,163,163,145,82,234,32,148,84,198,73,41,157,32,52,100,21,0,0,8,0,0,33,132,20,82,72,33,133,20,82,72,33,133,20,82,136,33,134,24,98,200,41,167,156,130,10,42,169,164,162,138,50,202,44,179,204,50,203,44,179,204,50,235,176,179,206,58,236,48,196,16,67,12,173,180,18,75,77,181,213,88,99,173,185,231,156,107,14,210,90,105,173,181,214,74,41,165,148,82,74,41,8,13,89,5,0,128,0,0,16,8,25,100,144,65,70,33,133,20,82,136,33,166,156,114,202,41,168,160,2,66,67,86,1,0,128,0,0,2,0,0,0,60,201,115,68,71,116,68,71,116,68,71,116,68,71,116,68,199,115,60,71,148,68,73,148,68,73,180,76,203,212,76,79,21,85,213,149,93,91,214,101,221,246,109,97,23,118,221,247,117,223,247,117,227,215,133,97,89,150,101,89,150,101,89,150,101,89,150,101,89,150,101,89,130,208,144,85,0,0,8,0,0,128,16,66,8,33,133,20,82,72,33,165,24,99,204,49,231,160,147,80,66,32,52,100,21,0,0,8,0,32,0,0,0,192,81,28,197,113,36,71,114,36,201,146,44,73,147,52,75,179,60,205,211,60,77,244,68,81,20,77,211,84,69,87,116,69,221,180,69,217,148,77,215,116,77,217,116,85,89,181,93,89,182,109,217,214,109,95,150,109,223,247,125,223,247,125,223,247,125,223,247,125,223,247,117,29,8,13,89,5,0,72,0,0,232,72,142,164,72,138,164,72,142,227,56,146,36,1,161,33,171,0,0,25,0,0,1,0,40,138,163,56,142,227,72,146,36,73,150,164,73,158,229,89,162,102,106,166,103,122,170,168,2,161,33,171,0,0,64,0,0,1,0,0,0,0,0,40,154,226,41,166,226,41,162,226,57,162,35,74,162,101,90,162,166,106,174,40,155,178,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,174,235,186,46,16,26,178,10,0,144,0,0,208,145,28,201,145,28,73,145,20,73,145,28,201,1,66,67,86,1,0,50,0,0,2,0,112,12,199,144,20,201,177,44,75,211,60,205,211,60,77,244,68,79,244,76,79,21,93,209,5,66,67,86,1,0,128,0,0,2,0,0,0,0,0,48,36,195,82,44,71,115,52,73,148,84,75,181,84,77,181,84,75,21,85,79,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,85,53,77,211,52,77,32,52,100,37,0,16,5,0,0,58,75,45,214,218,43,128,148,130,86,131,104,16,100,16,115,239,144,83,78,98,16,162,98,204,65,204,65,117,16,66,105,189,199,204,49,6,173,230,88,49,132,152,196,88,51,135,20,131,210,2,161,33,43,4,128,208,12,0,131,36,1,146,166,1,146,166,1,0,0,0,0,0,0,128,228,105,128,38,138,128,38,138,0,0,0,0,0,0,0,32,105,26,160,137,34,160,137,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,146,166,1,158,41,2,154,40,2,0,0,0,0,0,0,128,38,138,128,104,170,128,168,154,0,0,0,0,0,0,0,160,137,34,32,170,34,32,154,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,146,166,1,154,40,2,158,40,2,0,0,0,0,0,0,128,38,138,128,168,154,128,40,170,0,0,0,0,0,0,0,160,137,38,32,154,42,32,170,38,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,0,0,128,0,7,0,128,0,11,161,208,144,21,1,64,156,0,128,193,113,44,11,0,0,28,73,210,44,0,0,112,36,75,211,0,0,192,210,52,81,4,0,0,75,211,68,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,192,128,3,0,64,128,9,101,160,208,144,149,0,64,20,0,128,65,49,60,13,96,89,0,203,2,104,26,64,211,0,158,7,240,60,128,40,2,0,1,0,0,5,14,0,0,1,54,104,74,44,14,80,104,200,74,0,32,10,0,192,160,40,150,101,89,158,7,77,211,52,81,132,166,105,154,40,66,211,52,79,20,161,105,154,38,138,16,69,207,51,77,120,162,231,153,38,76,83,20,77,19,136,162,105,10,0,0,40,112,0,0,8,176,65,83,98,113,128,66,67,86,2,0,33,1,0,6,71,177,44,79,243,60,207,19,69,211,84,85,104,154,231,137,162,40,138,166,105,170,42,52,205,243,68,81,20,77,211,52,85,21,154,230,121,162,40,138,166,169,170,170,10,77,243,60,81,20,69,211,84,85,85,133,231,137,162,40,154,166,105,170,170,235,194,243,68,81,20,77,211,52,85,213,117,33,138,162,104,154,166,169,170,170,235,186,64,20,77,211,52,85,85,85,93,23,136,162,105,154,166,170,186,174,44,3,81,52,77,211,84,85,215,149,101,96,154,170,170,170,170,235,186,178,12,80,77,85,85,85,215,149,101,128,170,186,170,235,186,174,44,3,84,85,117,93,215,149,101,25,224,186,174,235,202,178,108,219,0,92,215,117,101,217,182,5,0,0,28,56,0,0,4,24,65,39,25,85,22,97,163,9,23,30,128,66,67,86,4,0,81,0,0,128,49,76,41,166,148,97,76,66,40,33,52,138,73,8,41,132,76,74,74,169,149,84,65,72,37,165,82,42,8,169,164,84,74,70,165,165,148,82,202,32,148,82,82,42,21,132,84,74,42,165,0,0,176,3,7,0,176,3,11,161,208,144,149,0,64,30,0,0,65,136,82,140,49,198,156,148,82,41,198,156,115,78,74,169,20,99,206,57,39,165,100,140,49,231,156,147,82,50,198,152,115,206,73,41,29,115,206,57,231,164,148,140,57,231,156,115,82,74,231,156,115,206,57,41,165,148,206,57,231,156,148,82,74,8,157,115,78,74,41,165,115,206,57,39,0,0,168,192,1,0,32,192,70,145,205,9,70,130,10,13,89,9,0,164,2,0,24,28,199,178,52,77,211,60,79,20,53,73,210,52,207,243,60,81,52,77,77,178,52,205,243,60,79,20,77,147,231,121,158,40,138,162,105,170,42,207,243,60,81,20,69,211,84,85,174,43,138,166,105,154,170,170,170,100,89,20,69,209,52,85,85,117,97,154,166,169,170,170,234,186,48,77,81,84,85,213,117,93,200,178,105,170,170,235,202,50,108,219,52,85,213,117,101,25,168,170,170,202,174,44,3,215,85,85,215,149,101,1,0,224,9,14,0,64,5,54,172,142,112,82,52,22,88,104,200,74,0,32,3,0,128,32,4,33,165,20,66,74,41,132,148,82,8,41,165,16,18,0,0,48,224,0,0,16,96,66,25,40,52,100,69,0,16,39,0,0,32,36,165,130,78,74,37,161,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,147,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,146,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,73,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,82,74,41,165,148,10,0,208,141,112,0,208,125,48,161,12,20,26,178,18,0,72,5,0,0,140,81,138,49,8,169,197,86,33,196,152,115,18,90,107,173,66,136,49,231,36,180,148,98,207,152,115,16,74,105,45,182,158,49,199,32,148,146,90,139,189,148,206,73,73,173,181,24,123,42,29,163,146,82,75,49,246,222,75,41,37,165,216,98,236,189,167,144,66,142,45,198,216,123,207,49,165,22,91,171,177,247,94,99,74,177,213,24,99,239,189,247,24,99,171,177,214,222,123,239,49,182,86,107,142,5,0,96,54,56,0,64,36,216,176,58,194,73,209,88,96,161,33,43,1,128,144,0,0,194,24,165,24,99,204,57,231,156,115,78,74,201,24,115,206,65,8,33,132,16,74,41,25,99,204,57,8,33,132,16,66,41,37,99,206,57,7,33,132,80,66,40,165,100,204,57,232,32,132,80,66,40,165,148,206,57,7,29,132,16,66,9,165,148,146,49,231,32,132,16,66,9,165,148,82,58,231,32,132,16,66,40,165,132,84,74,41,157,131,16,66,40,33,132,82,74,73,41,132,16,66,8,161,132,80,82,41,41,133,16,66,8,33,132,80,66,74,37,165,16,66,8,33,132,16,74,72,165,164,148,82,8,33,132,16,66,8,165,148,148,82,10,37,148,16,66,40,161,164,146,74,41,165,132,16,74,8,161,164,84,82,42,169,148,18,66,8,37,132,146,74,74,41,149,84,74,40,33,132,82,0,0,192,129,3,0,64,128,17,116,146,81,101,17,54,154,112,225,1,40,52,100,37,0,16,5,0,0,25,7,29,148,150,27,128,144,114,212,90,135,28,132,20,91,11,145,67,12,90,140,157,114,140,65,74,41,100,144,49,198,164,149,146,66,199,24,164,212,98,75,161,131,20,123,207,185,149,212,2,0,0,32,8,0,8,48,1,4,6,8,10,190,16,2,98,12,0,64,16,34,51,68,66,97,21,44,48,40,131,6,135,121,0,240,0,17,33,17,0,36,38,40,210,46,46,160,203,0,23,116,113,215,129,16,130,16,132,32,22,7,80,64,2,14,78,184,225,137,55,60,225,6,39,232,20,149,58,16,0,0,0,0,128,5,0,120,0,0,64,40,128,136,136,102,174,194,226,2,35,67,99,131,163,195,227,3,68,0,0,0,0,0,176,0,224,3,0,0,9,1,34,34,154,185,10,139,11,140,12,141,13,142,14,143,15,144,0,0,64,0,1,0,0,0,0,16,64,0,2,2,2,0,0,0,0,0,1,0,0,0,2,2,79,103,103,83,0,0,64,138,0,0,0,0,0,0,70,39,0,0,2,0,0,0,207,57,232,117,36,36,174,139,135,126,119,116,114,127,119,120,124,120,119,114,116,114,114,112,113,109,114,115,118,110,99,104,114,108,111,113,110,108,108,110,101,220,214,205,147,236,109,61,221,132,253,252,228,236,98,129,7,144,92,251,31,117,86,185,12,195,41,173,126,242,99,157,163,106,215,77,0,122,200,149,246,239,254,148,146,31,210,152,1,101,23,1,145,94,198,111,254,124,83,201,139,52,118,168,215,241,8,240,47,64,121,191,13,198,96,239,179,79,87,7,215,92,132,88,169,63,38,4,0,102,244,190,51,46,94,159,245,158,78,120,164,178,99,45,172,232,136,185,193,242,104,51,15,107,45,100,174,243,32,53,47,245,157,10,231,110,236,227,225,91,163,99,125,34,57,143,207,59,236,166,0,210,10,0,232,30,0,235,244,62,192,141,32,117,0,226,158,17,146,4,105,25,64,144,0,160,207,190,194,72,0,80,172,16,47,172,45,161,182,106,32,213,21,76,70,215,212,224,198,8,150,247,121,93,176,68,40,224,166,27,136,152,116,155,249,84,238,149,185,68,72,62,41,214,153,95,231,190,212,199,120,48,182,158,16,65,101,217,12,124,183,111,41,227,197,153,10,131,63,88,89,227,133,221,94,95,55,6,58,54,110,255,232,180,178,175,245,35,34,97,34,0,192,222,252,246,95,52,33,111,233,69,24,157,3,76,73,26,18,25,253,211,77,171,141,178,120,208,52,106,0,180,18,192,174,64,53,62,1,128,82,0,156,201,28,147,125,161,54,138,86,203,0,78,58,0,44,73,155,206,1,240,6,70,180,194,71,72,214,23,178,172,224,162,206,47,251,34,208,24,171,32,193,173,136,112,177,12,24,0,94,25,142,217,159,114,149,234,198,167,250,221,161,54,16,49,157,228,26,126,166,169,90,238,135,254,103,203,140,196,248,224,250,208,119,6,238,172,45,182,156,235,39,36,34,36,2,0,0,29,0,205,61,80,194,13,155,199,188,1,75,237,14,157,171,19,60,71,115,52,154,214,25,39,222,78,220,126,62,156,64,250,89,0,124,251,230,29,160,98,75,237,192,49,114,234,1,160,6,98,0,218,116,2,64,24,3,184,127,126,76,238,31,220,247,167,83,180,166,23,181,102,211,165,244,4,107,1,21,183,66,2,129,129,11,30,41,54,217,159,105,45,165,85,237,187,29,134,68,108,146,99,248,221,238,75,44,227,161,62,143,198,45,227,30,174,15,81,3,116,188,253,52,137,237,112,5,63,2,36,68,4,0,0,208,216,32,255,183,214,244,23,244,229,163,208,1,141,163,179,41,36,82,135,181,59,133,228,223,149,130,52,5,224,225,247,5,0,183,1,6,72,254,5,192,49,203,234,199,133,46,3,250,86,87,41,210,0,0,227,85,199,90,53,218,91,244,106,196,218,130,138,213,172,96,65,194,184,64,192,0,126,25,78,246,119,123,63,74,90,56,59,44,104,4,203,224,103,218,119,117,149,79,238,45,0,248,3,112,54,190,87,250,218,130,196,102,60,124,141,133,171,97,51,18,33,18,32,2,0,0,176,142,109,229,75,146,107,250,22,126,98,87,17,174,135,206,17,37,201,35,56,115,2,253,123,2,55,2,233,53,0,164,11,224,248,160,44,150,71,17,198,225,24,70,186,191,5,160,26,30,121,198,25,64,219,179,16,61,224,171,64,65,63,1,133,196,66,37,2,190,24,46,225,107,190,110,161,61,184,143,32,184,4,23,242,171,173,37,186,177,242,115,36,46,197,15,1,250,229,79,42,107,110,224,155,130,209,34,174,143,72,136,4,144,16,0,0,58,2,168,84,223,205,228,204,187,121,161,251,51,248,237,30,17,233,85,220,78,173,65,244,251,193,25,0,189,4,0,142,1,0,173,1,64,47,0,148,128,1,100,232,216,1,64,180,147,0,70,123,64,28,55,89,171,42,80,16,22,80,81,85,92,92,8,0,126,248,77,220,251,168,71,172,239,158,231,113,176,69,92,134,23,229,53,155,71,105,159,234,217,2,129,31,0,151,143,174,89,6,132,235,36,82,204,43,62,18,17,33,34,2,0,0,16,4,226,143,43,30,62,176,55,132,106,125,4,123,27,69,190,150,19,230,26,239,106,5,186,17,0,80,2,0,255,10,240,4,238,205,0,55,87,149,17,101,11,224,174,101,100,240,10,128,248,50,160,26,131,8,243,4,5,2,3,68,131,1,68,34,222,200,45,220,247,244,62,106,25,15,221,189,67,223,244,178,208,248,157,131,231,172,79,101,126,138,207,109,8,252,65,11,242,252,254,203,222,101,0,54,198,215,139,161,115,174,84,78,132,136,132,136,8,0,128,202,131,65,122,165,217,219,121,181,8,88,137,129,126,158,80,14,170,222,72,97,125,27,164,224,97,21,142,49,216,129,180,35,0,191,84,56,148,67,144,74,0,129,163,231,180,44,0,122,211,118,12,38,3,165,105,125,82,3,128,227,12,208,128,130,36,144,64,82,145,128,0,126,200,109,246,199,44,142,90,111,60,55,208,200,29,249,143,182,142,210,86,238,45,24,124,176,157,187,125,6,124,84,89,120,165,78,72,136,132,136,136,0,128,242,243,2,95,189,53,94,28,190,127,44,245,82,82,211,217,34,207,188,220,162,242,44,145,194,234,123,25,208,177,119,88,17,160,12,192,101,188,23,156,38,0,56,168,34,12,117,118,130,177,103,241,43,203,239,119,181,154,103,127,216,213,26,77,70,14,137,193,178,32,160,66,146,48,128,24,1,62,200,157,51,247,201,187,186,78,167,187,183,131,5,139,220,78,126,180,243,81,125,91,228,123,75,7,62,120,206,54,53,240,57,118,205,231,19,34,34,18,34,34,0,192,75,129,253,243,127,152,70,11,67,57,83,191,201,128,165,135,79,250,247,58,236,217,165,160,225,93,209,241,32,69,0,184,27,0,72,25,128,35,240,221,0,172,140,245,255,26,130,134,249,106,205,58,215,187,5,8,65,25,168,220,202,34,102,228,64,128,68,192,101,65,192,66,68,130,1,158,200,157,148,103,179,239,106,29,15,249,222,225,15,160,145,59,243,175,118,78,165,117,242,115,43,6,158,49,192,216,215,62,200,180,107,166,56,124,68,34,68,66,66,0,224,55,0,172,75,146,156,91,195,133,118,20,218,181,225,249,199,254,230,97,107,212,224,172,253,126,47,66,34,176,26,0,213,49,128,164,170,1,2,204,1,168,51,0,41,46,209,103,106,134,132,165,98,235,86,0,224,201,103,165,182,203,21,132,219,128,27,11,131,68,133,164,66,33,17,193,64,68,2,62,200,45,220,199,76,119,213,223,180,231,54,12,139,220,133,124,182,243,168,190,61,212,123,107,132,101,60,67,130,104,127,148,185,48,74,56,127,66,36,68,68,68,0,64,14,32,121,74,118,72,247,81,163,194,195,239,215,155,251,165,110,118,48,77,187,63,213,107,122,16,41,222,6,167,24,224,235,192,190,194,2,205,49,0,254,70,187,114,104,43,173,125,53,0,81,138,228,137,238,241,64,8,200,88,203,197,85,128,232,194,34,128,225,194,160,66,100,128,2,30,200,45,220,123,198,84,203,187,42,239,109,36,51,200,237,246,243,216,143,114,168,207,109,32,197,15,1,196,149,103,198,218,129,155,44,154,43,209,20,17,137,8,137,16,0,0,202,12,64,189,194,21,230,202,178,160,202,118,181,58,127,137,33,195,214,211,35,208,27,237,148,20,206,67,86,0,232,0,64,218,41,14,220,17,64,170,14,0,174,120,128,241,234,151,22,6,248,66,234,222,72,86,196,39,128,132,215,123,35,22,44,168,5,40,18,40,8,72,94,200,237,220,171,93,71,117,99,225,222,18,130,65,238,108,63,142,167,43,229,146,159,219,8,124,96,178,4,58,113,104,120,126,66,34,36,66,4,0,64,56,95,129,201,78,54,254,215,221,234,222,68,181,128,127,236,79,139,167,162,51,225,56,218,234,136,126,92,14,240,214,172,2,64,65,239,12,192,151,3,3,228,10,0,255,35,141,24,147,250,217,82,115,17,24,204,202,123,184,64,53,16,112,225,194,192,197,74,64,98,224,178,0,30,201,221,225,115,196,173,106,91,213,179,35,236,24,25,22,185,59,247,40,251,82,221,184,228,179,67,47,224,135,181,195,122,215,79,98,36,208,51,42,206,121,66,68,34,68,68,34,4,0,52,183,96,103,177,109,234,181,71,96,140,187,17,88,124,210,143,112,107,132,253,21,46,26,170,24,0,5,53,192,207,108,245,129,107,3,140,6,40,25,128,141,107,117,1,72,45,40,218,172,70,41,17,217,34,37,12,160,68,16,161,184,36,80,112,1,254,200,93,209,107,239,183,186,238,23,103,135,15,10,185,147,242,152,181,163,250,231,170,222,27,240,194,47,43,163,210,57,27,145,16,137,8,9,0,0,118,27,193,179,154,170,39,159,29,198,130,102,25,62,61,143,233,41,223,248,133,205,110,103,29,52,54,74,103,144,83,27,64,153,129,122,19,72,61,0,164,185,1,80,59,209,198,127,186,65,160,170,125,100,34,160,118,121,38,149,162,170,80,22,1,42,3,46,17,11,6,21,17,10,30,200,109,234,179,57,183,90,238,135,112,182,33,88,228,46,224,53,213,173,150,179,168,103,43,4,94,32,195,168,96,88,157,136,144,16,137,144,0,0,6,107,16,179,125,251,207,108,191,231,55,219,38,131,113,250,228,241,135,36,111,194,139,216,29,76,135,210,176,65,183,152,48,210,36,0,52,3,86,96,26,152,1,80,11,125,10,0,132,7,166,76,242,25,203,51,44,62,77,136,224,114,5,160,10,36,32,98,17,45,36,16,12,0,62,201,221,162,199,214,111,213,61,47,117,238,80,91,4,80,200,29,249,231,188,189,170,251,233,152,27,240,130,98,167,210,208,100,249,145,136,144,136,144,0,0,16,156,55,97,52,251,81,111,78,54,100,131,89,210,152,63,240,180,184,248,241,45,12,242,40,116,125,198,55,115,245,2,60,231,2,218,129,22,62,224,153,225,123,225,195,2,200,167,9,29,234,61,113,112,140,6,4,46,151,26,89,136,16,32,18,176,184,80,113,1,158,200,93,137,71,115,239,74,251,144,247,214,10,57,144,200,221,42,183,102,95,202,252,180,236,109,3,94,216,167,243,177,22,147,113,62,34,34,33,34,18,1,0,128,178,33,79,209,209,246,147,243,246,147,241,204,89,80,93,246,183,92,157,198,112,127,54,146,229,170,163,231,205,10,77,150,41,0,47,37,64,21,180,176,5,248,229,144,202,6,240,36,2,176,38,34,8,140,83,141,48,192,138,1,84,5,3,168,5,92,92,23,36,62,201,221,178,199,106,187,170,251,161,204,29,225,0,6,185,139,117,159,218,82,246,162,59,219,97,11,94,176,71,42,163,113,205,8,17,9,1,18,34,2,0,192,145,91,48,133,156,239,198,27,82,179,121,132,238,219,163,29,221,124,86,251,60,131,56,205,72,183,9,184,96,0,244,32,0,164,76,8,148,172,52,246,43,254,29,236,143,168,0,1,0,104,6,234,6,156,105,4,18,133,2,34,146,130,4,146,136,4,158,200,61,200,123,111,159,122,236,151,108,135,74,136,64,238,68,60,38,127,212,245,188,24,91,113,240,130,213,217,80,139,86,28,17,145,144,144,136,16,0,0,62,51,4,62,61,76,230,177,255,229,122,50,138,38,181,206,24,174,79,103,246,77,109,244,172,26,157,73,7,143,3,144,250,0,80,139,1,132,18,128,235,57,240,219,242,202,74,51,135,136,108,196,95,174,49,127,51,48,232,132,132,74,1,97,0,145,8,129,68,165,160,2,190,200,93,137,167,138,3,213,178,23,157,29,40,195,12,26,185,11,241,170,251,167,174,189,48,118,224,129,192,11,54,122,43,138,51,158,144,136,136,16,145,8,0,0,236,193,201,251,89,213,215,141,207,44,127,166,161,21,25,209,120,246,41,146,93,45,73,78,220,143,105,70,239,12,33,102,45,0,234,43,192,225,72,5,74,3,24,145,7,172,63,238,239,49,2,154,70,183,185,176,41,145,34,136,34,40,84,2,6,72,84,10,72,6,0,94,201,125,192,219,116,142,50,31,186,177,157,103,87,82,185,95,254,81,206,95,153,171,197,182,5,207,80,136,193,22,253,113,26,13,57,227,156,16,137,8,17,145,16,16,0,246,209,175,246,241,242,235,60,183,214,48,29,93,13,127,226,212,247,241,218,171,253,31,55,9,247,196,77,209,13,210,206,0,56,2,136,91,106,190,171,17,181,1,156,138,40,208,214,110,45,6,132,122,197,74,1,28,86,171,80,193,189,16,192,66,68,41,40,8,32,160,0,222,201,189,233,151,102,13,149,123,81,108,141,22,102,193,191,234,85,17,80,153,4,123,158,192,103,131,53,144,20,237,242,1,32,34,4,4,8,17,16,128,252,212,37,243,43,214,112,109,109,116,40,104,219,176,253,107,123,181,184,96,32,191,95,101,152,95,246,169,109,96,37,29,97,162,152,128,157,97,69,55,199,174,115,84,238,240,245,10,123,234,225,231,38,127,187,45,234,165,143,194,32,130,187,160,226,194,192,177,0,222,201,125,137,251,252,124,202,89,21,219,8,118,197,155,101,60,35,62,1,209,49,131,215,130,35,118,61,39,128,132,0,0,0,0,0,0,0,24,118,227,238,180,165,50,5,227,103,154,35,26,97,52,155,199,230,217,245,27,182,49,84,195,247,15,53,138,162,91,197,92,167,200,0,154,46,0,92,1,40,109,52,139,93,140,54,87,107,34,141,233,24,201,74,242,12,18,5,84,126,201,189,235,187,166,14,149,179,170,182,25,90,197,63,125,171,214,73,0,7,240,146,107,52,150,12,174,8,16,0,0,0,128,0,0,0,160,111,57,217,138,43,84,53,93,44,54,106,196,225,244,165,142,206,50,110,124,164,27,191,54,109,247,251,206,159,113,94,221,247,213,79,34,180,199,104,57,254,165,93,148,15,252,162,177,15,142,26,1,41,89,173,58,27,169,214,1,128,115,89,17,11,12,222,200,189,130,235,188,191,202,125,89,109,32,213,251,43,110,91,255,148,27,54,224,37,153,174,117,104,87,156,115,2,128,144,0,32,36,36,0,0,84,83,75,149,232,165,142,175,207,172,239,142,102,79,61,56,138,245,121,240,238,139,147,222,124,204,236,253,179,221,235,186,185,14,165,247,79,131,95,117,11,64,58,17,194,54,27,77,18,113,58,25,160,70,210,38,0,56,160,183,34,128,220,61,247,56,69,21,161,192,112,129,193,66,1,30,201,189,211,235,108,189,202,254,180,216,6,82,86,189,127,227,153,254,41,243,161,183,5,2,175,169,152,98,88,100,56,17,32,4,0,145,8,17,0,0,237,18,255,80,154,209,249,125,59,56,90,189,47,6,183,17,27,247,196,83,211,255,179,131,139,145,207,218,137,175,142,61,213,234,213,149,29,196,28,128,9,212,203,137,172,13,88,1,235,22,0,12,241,26,185,131,33,133,8,139,4,12,36,2,5,23,34,30,201,189,209,155,102,19,42,227,194,22,8,82,187,191,211,54,241,11,3,14,224,115,65,6,112,96,84,57,87,4,136,144,144,136,16,1,0,168,254,100,156,90,168,27,105,214,221,158,89,92,72,30,14,11,123,237,215,234,193,57,135,46,193,186,82,119,111,16,187,6,144,50,3,166,185,127,57,124,186,250,27,50,42,9,134,216,187,223,225,95,128,16,209,213,0,144,32,176,19,192,181,176,96,81,33,88,72,224,114,1,222,200,189,195,109,235,187,178,47,125,217,134,220,156,114,191,253,77,153,80,105,43,182,64,224,37,208,62,88,140,140,11,139,72,136,132,136,68,8,8,64,126,190,24,247,165,105,99,101,234,191,181,175,48,236,188,49,155,200,200,15,151,105,115,106,30,41,171,46,233,234,96,9,213,20,128,60,11,0,26,0,125,244,47,225,83,208,8,0,132,28,86,81,6,224,64,176,74,100,16,160,32,144,16,97,176,184,32,137,40,24,176,0,222,200,189,131,109,187,127,74,251,212,217,174,194,5,159,220,175,116,77,61,202,188,72,27,87,188,196,178,93,28,38,87,60,0,132,136,136,136,72,0,0,72,211,254,208,23,43,52,237,117,222,231,58,159,87,216,136,15,55,47,171,251,127,126,169,141,211,49,33,8,141,80,70,5,155,0,64,142,10,236,34,9,70,67,0,145,10,0,101,42,41,59,126,245,0,126,105,245,10,17,4,148,128,128,10,10,6,18,46,18,158,200,189,17,219,195,121,149,246,75,103,79,224,147,251,227,182,217,31,197,3,91,148,0,63,114,197,192,186,77,111,96,137,235,194,144,16,17,9,137,136,8,0,0,233,92,172,24,229,41,27,241,0,0,157,192,82,57,216,47,77,193,117,58,93,141,239,6,195,24,176,159,8,100,141,67,17,40,3,0,169,91,97,224,248,225,192,192,45,211,128,1,41,61,28,190,64,149,64,176,192,13,192,98,88,64,140,0,222,201,253,114,151,172,79,72,151,206,150,0,58,185,63,110,219,206,87,25,191,169,182,17,248,44,20,187,3,194,104,50,197,3,36,66,36,36,68,4,0,96,218,170,130,169,94,224,255,215,130,253,102,33,9,247,164,118,61,29,201,46,182,232,165,183,86,236,44,219,244,42,130,148,3,192,20,192,7,3,157,5,240,37,0,62,133,81,7,6,153,85,14,244,23,203,79,133,65,128,0,11,87,164,192,5,99,1,222,201,253,235,247,212,173,140,151,203,150,21,14,157,220,223,238,200,124,149,242,105,177,53,4,224,20,155,92,115,4,72,68,136,68,132,0,0,160,49,208,131,133,171,220,74,114,254,238,247,174,156,212,117,233,232,196,212,134,251,110,231,230,121,27,119,202,114,223,227,249,2,25,16,0,182,21,176,247,156,75,85,64,174,2,0,151,0,184,58,6,130,6,99,219,0,136,179,107,84,20,17,46,196,10,44,172,2,140,11,126,201,125,201,107,218,175,204,30,27,168,228,126,138,51,253,81,70,167,179,53,178,24,47,201,22,66,156,41,22,32,33,34,34,17,33,0,0,98,42,165,255,174,32,117,226,159,83,66,205,27,167,167,196,162,29,44,211,35,149,137,58,145,195,197,10,216,4,172,28,159,168,182,80,203,5,164,28,3,179,45,253,172,79,192,85,170,182,18,139,8,43,1,139,32,1,139,11,137,5,23,79,103,103,83,0,4,180,169,0,0,0,0,0,0,70,39,0,0,3,0,0,0,31,46,16,223,8,102,106,102,106,113,104,113,120,62,201,125,202,203,228,191,242,238,68,91,73,74,38,247,59,30,241,95,185,23,108,192,107,44,85,99,153,77,136,132,68,136,132,4,0,64,220,152,100,95,201,186,254,242,49,253,195,241,162,97,99,250,210,240,244,184,197,147,223,211,174,151,207,93,32,193,245,8,232,0,172,200,74,76,163,19,199,130,114,47,112,158,108,135,52,149,85,169,68,12,22,136,12,144,92,10,16,69,144,48,0,222,200,189,137,173,166,133,202,236,177,173,97,146,251,146,167,178,160,50,122,201,54,2,159,129,237,12,36,45,4,159,16,145,144,144,144,8,0,128,168,39,237,20,59,11,86,247,175,103,87,113,149,226,216,194,25,237,113,89,215,245,234,159,20,179,86,177,108,62,36,4,40,19,124,32,130,220,115,4,48,153,39,253,83,204,71,89,202,39,251,91,67,77,112,161,70,160,12,36,168,32,32,17,97,80,0,254,200,189,177,139,218,73,202,33,219,182,240,200,125,138,51,241,43,79,216,128,207,224,36,128,101,84,213,132,136,72,132,72,72,0,0,228,252,197,208,41,89,246,155,166,67,87,72,97,136,86,219,171,157,196,13,121,12,177,213,168,106,133,186,170,106,152,51,0,141,0,178,20,86,15,174,26,0,177,1,166,172,114,204,119,71,71,74,45,12,3,42,6,68,9,68,5,22,46,174,11,11,190,200,125,200,179,137,95,121,174,170,237,144,164,60,114,63,217,158,218,149,185,234,109,179,140,151,224,113,112,172,19,33,34,18,33,33,33,0,0,162,187,98,115,169,104,29,201,197,170,251,89,179,163,121,212,246,179,131,151,121,223,136,185,222,27,179,84,13,155,194,33,192,110,136,224,22,14,163,1,61,184,18,0,148,64,0,171,161,125,147,155,31,193,160,66,82,16,88,184,32,162,162,48,192,66,0,126,200,125,210,189,105,175,178,47,217,214,66,67,34,247,169,247,156,95,241,208,217,214,224,181,120,107,28,102,62,64,68,4,132,68,136,0,0,92,205,247,121,190,243,214,127,126,249,48,42,217,217,180,203,167,69,94,60,39,166,254,237,242,237,238,196,44,70,247,164,12,87,105,178,89,250,221,64,181,10,96,123,0,110,84,254,228,110,200,107,228,10,3,240,81,67,201,110,199,124,217,97,32,33,160,96,17,4,84,40,4,136,0,190,200,125,200,179,109,191,50,46,193,54,139,40,228,94,216,169,117,80,9,171,104,107,89,5,47,46,83,160,165,170,34,34,33,32,36,68,68,0,32,184,255,119,54,87,39,99,247,245,48,186,175,177,26,115,108,50,195,217,171,3,236,196,215,13,167,44,104,203,181,12,202,60,240,5,124,34,160,9,128,119,108,81,160,14,224,48,62,101,19,144,29,32,16,72,160,186,88,176,184,192,165,138,0,62,200,125,208,117,170,87,153,43,54,112,200,125,201,53,241,10,115,81,29,7,64,198,235,228,162,172,141,154,171,1,34,1,34,66,68,4,0,64,214,210,240,226,255,132,150,191,214,6,135,213,197,58,157,110,196,240,226,165,154,120,233,181,205,100,63,126,80,178,28,167,179,36,73,224,178,169,4,32,234,1,112,117,2,220,138,69,29,0,168,7,32,211,145,237,127,47,131,145,105,137,80,41,48,22,84,112,25,168,92,176,12,0,254,200,253,93,198,109,222,218,122,35,118,168,224,145,187,185,105,107,95,218,238,24,78,16,240,1,219,3,167,123,216,21,63,34,18,2,0,16,0,0,0,128,249,112,159,122,187,84,152,222,190,184,104,220,176,47,26,51,147,108,230,104,219,13,183,143,205,131,159,226,235,91,113,108,122,125,19,235,179,206,230,209,110,45,199,117,21,3,92,86,113,224,126,114,169,157,32,77,125,0,74,231,89,252,70,59,27,116,230,48,129,62,41,151,5,131,0,87,65,1];


    init();

})();
