import React, { useState } from 'react';
import SaveResultReact from './SaveResultReact';

// Basic XML to JSON parser for table display
const xmlToJson = (xml) => {
  let obj = {};

  if (xml.nodeType === 1) { // element
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        const attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) { // text
    obj = xml.nodeValue.trim();
  }

  if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
    // If only one text node child
    const textVal = xml.childNodes[0].nodeValue.trim();
    if (obj["@attributes"]) {
      obj["#text"] = textVal;
    } else {
      obj = textVal;
    }
  } else if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i);
      const nodeName = item.nodeName;
      if (nodeName === "#text" && item.nodeValue.trim() === '') continue;

      if (typeof (obj[nodeName]) === "undefined") {
        const result = xmlToJson(item);
        if (result !== "") obj[nodeName] = result;
      } else {
        if (typeof (obj[nodeName].push) === "undefined") {
          const old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  
  if (Object.keys(obj).length === 0) return null;
  return obj;
};

// Simple XML beautifier
const formatXml = (xml, space = '  ') => {
  let formatted = '';
  let pad = 0;
  
  // Remove formatting
  const rawXml = xml.replace(/(>)(<)(\/*)/g, '$1\n$2$3');
  const lines = rawXml.split('\n');
  
  lines.forEach((line) => {
    let indent = 0;
    if (line.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (line.match(/^<\/\w/)) {
      if (pad !== 0) pad -= 1;
    } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
      indent = 1;
    } else {
      indent = 0;
    }
    
    formatted += space.repeat(Math.max(0, pad)) + line + '\n';
    pad += indent;
  });
  
  return formatted.trim();
};

const flattenObject = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
};

export default function XmlEditor() {
  const [input, setInput] = useState('<?xml version="1.0" encoding="UTF-8"?>\n<catalog>\n  <book id="bk101">\n    <author>Gambardella, Matthew</author>\n    <title>XML Developer\'s Guide</title>\n  </book>\n</catalog>');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('formatted');
  const [parsedData, setParsedData] = useState(null);

  const handleFormat = (spaceStr) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(input, "text/xml");
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      
      if (parseError.length > 0) {
        throw new Error(parseError[0].textContent);
      }
      
      const formatted = formatXml(input, spaceStr);
      setInput(formatted);
      setParsedData(xmlToJson(xmlDoc));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleValidate = () => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(input, "text/xml");
      const parseError = xmlDoc.getElementsByTagName("parsererror");
      
      if (parseError.length > 0) {
        throw new Error(parseError[0].textContent);
      }
      
      setParsedData(xmlToJson(xmlDoc));
      setError(null);
      alert('Valid XML!');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleMinify = () => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(input, "text/xml");
      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        throw new Error("Invalid XML");
      }
      const minified = input.replace(/\>[\r\n ]+\</g, "><").replace(/(<.*?>)|\s+/g, (m, $1) => $1 ? $1 : ' ').trim();
      setInput(minified);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const renderTable = (data) => {
    if (!data) return <p className="text-zinc-400">No valid XML data to display.</p>;
    
    // Find the first array (list of nodes) to act as table rows
    let targetArray = null;
    
    const findArray = (obj) => {
      if (Array.isArray(obj)) return obj;
      if (typeof obj === 'object' && obj !== null) {
        for (let key in obj) {
          const res = findArray(obj[key]);
          if (res) return res;
        }
      }
      return null;
    };
    
    targetArray = findArray(data);
    
    if (targetArray) {
      const flattenedArray = targetArray.map(item => typeof item === 'object' && item !== null ? flattenObject(item) : { value: item });
      const allKeys = Array.from(new Set(flattenedArray.flatMap(Object.keys)));
      
      return (
        <div className="overflow-x-auto rounded-lg border border-white/[0.1]">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-[#1a1a24] text-xs uppercase font-semibold text-zinc-400">
              <tr>
                {allKeys.map(key => <th key={key} className="px-4 py-3 border-b border-white/[0.1]">{key}</th>)}
              </tr>
            </thead>
            <tbody>
              {flattenedArray.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                  {allKeys.map(key => (
                    <td key={key} className="px-4 py-3">{row[key] !== undefined ? JSON.stringify(row[key]) : '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (typeof data === 'object' && data !== null) {
      const flattened = flattenObject(data);
      return (
        <div className="overflow-x-auto rounded-lg border border-white/[0.1]">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-[#1a1a24] text-xs uppercase font-semibold text-zinc-400">
              <tr>
                <th className="px-4 py-3 border-b border-white/[0.1] w-1/3">Node Path</th>
                <th className="px-4 py-3 border-b border-white/[0.1]">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(flattened).map(([key, value]) => (
                <tr key={key} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-[#2dd4bf]">{key}</td>
                  <td className="px-4 py-3 font-mono">{JSON.stringify(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return <p className="text-zinc-300">{String(data)}</p>;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full h-full min-h-[600px]">
      {/* Input Side */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center bg-[#0d0d14] px-4 py-3 border border-white/[0.06] rounded-t-xl border-b-0 overflow-x-auto whitespace-nowrap">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mr-4">Input XML</h2>
          <div className="flex gap-2">
            <button onClick={() => handleFormat('  ')} className="px-3 py-1.5 text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-white rounded transition-colors border border-white/[0.1]">Format 2 Spaces</button>
            <button onClick={() => handleFormat('    ')} className="px-3 py-1.5 text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-white rounded transition-colors border border-white/[0.1]">Format 4 Spaces</button>
            <button onClick={handleMinify} className="px-3 py-1.5 text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-white rounded transition-colors border border-white/[0.1]">Minify</button>
            <button onClick={handleValidate} className="px-3 py-1.5 text-xs font-semibold bg-[#2dd4bf]/20 hover:bg-[#2dd4bf]/30 text-[#2dd4bf] rounded transition-colors border border-[#2dd4bf]/30">Validate</button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            try {
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(e.target.value, "text/xml");
              if (xmlDoc.getElementsByTagName("parsererror").length === 0) {
                 setParsedData(xmlToJson(xmlDoc));
                 setError(null);
              }
            } catch(err) {
              // Ignore partial typing errors
            }
          }}
          className="flex-1 w-full p-4 bg-[#1a1a24] border border-white/[0.06] rounded-b-xl focus:ring-1 focus:ring-[#ff6b35] focus:outline-none font-mono text-sm text-zinc-300 resize-none"
          spellCheck="false"
        />
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-mono flex items-center gap-2 overflow-x-auto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span className="whitespace-pre-wrap">{error}</span>
          </div>
        )}
      </div>

      {/* Output Side */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex bg-[#0d0d14] px-2 py-2 border border-white/[0.06] rounded-t-xl border-b-0 gap-2">
          <button 
            onClick={() => setActiveTab('formatted')}
            className={`px-4 py-1.5 text-sm font-semibold rounded transition-colors ${activeTab === 'formatted' ? 'bg-[#ff6b35] text-white' : 'text-zinc-400 hover:bg-white/[0.05]'}`}
          >
            Formatted Output
          </button>
          <button 
            onClick={() => setActiveTab('table')}
            className={`px-4 py-1.5 text-sm font-semibold rounded transition-colors ${activeTab === 'table' ? 'bg-[#ff6b35] text-white' : 'text-zinc-400 hover:bg-white/[0.05]'}`}
          >
            Table View
          </button>
        </div>
        <div className="flex-1 w-full p-4 bg-[#1a1a24] border border-white/[0.06] rounded-b-xl overflow-y-auto">
          {activeTab === 'formatted' ? (
             <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap">{input}</pre>
          ) : (
            renderTable(parsedData)
          )}
          
          {!error && parsedData && (
            <div className="mt-6 flex justify-end">
              <SaveResultReact
                toolName="XML Formatter & Validator"
                toolPath="/developer/xml-tools"
                payloadGenerator={() => ({
                  type: 'text',
                  data: `Valid XML formatted.\n\n${input.slice(0, 150)}${input.length > 150 ? '...' : ''}`
                })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
