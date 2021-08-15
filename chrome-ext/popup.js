var formatScriptBtn = document.getElementById("format-btn");

formatScriptBtn.addEventListener("click", async () => {
	formatScriptBtn.disabled = true;
  	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
    	function: getCreatioServerParameters
	}, sendFormatMessage);
});

const sendFormatMessage = (injectionResults) => {
	if (injectionResults && injectionResults.length !== 0){
		const injectionResult = injectionResults[0];
		if (injectionResult && injectionResult.result?.token && 
			injectionResult.result?.schemaUId && 
			injectionResult.result?.schemaUId){
				chrome.runtime.sendMessage({
					token: injectionResult.result.token,
					url: injectionResult.result.url,  
					schemaUId: injectionResult.result.schemaUId}, 
				processFormattedScript);
		}
	}
}

const processFormattedScript = async (response) => {
	formatScriptBtn.disabled = false;
	if (response && response.caption && response.rights && 
		response.rights.length !== 0 && response.schemaUId){
		const scriptFormatter = await getScriptFormatter();
		const sqlScript = scriptFormatter(response.caption, response.schemaUId, response.rights);
		const outputElement = document.getElementById("output");
		outputElement.textContent = sqlScript;
	}
}

const getScriptFormatter = async () => {
	const src = chrome.runtime.getURL("scriptFormatter.js");
	if (src){
		const formatterModule = await import(src);
		return formatterModule?.generateScript;
	}
	return null;
}

const getCreatioServerParameters = () => {
	if (document?.cookie && window?.location?.href && location?.origin){
		const cookies = document.cookie.split("=");
		const urlParts = window.location.href.split("/");
		if (cookies && cookies.length >= 1 && urlParts && urlParts.length !== 0){
			const token = cookies[1];
			const schemaUId = urlParts[urlParts.length - 1];
			const url = location.origin;
			return {url, token, schemaUId}
		}
	}
	return null;
}