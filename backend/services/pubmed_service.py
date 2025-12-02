import requests
import xml.etree.ElementTree as ET

def fetch_pubmed_data(drug_name):
    """
    Fetch research papers from PubMed for a given drug and 'nose-to-brain' or 'intranasal'.
    Uses the NCBI E-utilities API (public).
    
    Args:
        drug_name (str): Name of the drug.
        
    Returns:
        list: List of dicts containing title, abstract (if available), and link.
    """
    base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
    query = f"{drug_name}[Title/Abstract] AND (nose-to-brain[Title/Abstract] OR intranasal[Title/Abstract] OR nasal delivery[Title/Abstract])"
    
    try:
        # 1. ESearch: Find IDs
        search_url = f"{base_url}/esearch.fcgi?db=pubmed&term={query}&retmode=json&retmax=3"
        response = requests.get(search_url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        id_list = data.get("esearchresult", {}).get("idlist", [])
        
        if not id_list:
            return []
            
        # 2. ESummary: Get details (using esummary for speed/simplicity over efetch for full text)
        ids = ",".join(id_list)
        summary_url = f"{base_url}/esummary.fcgi?db=pubmed&id={ids}&retmode=json"
        summary_response = requests.get(summary_url, timeout=5)
        summary_response.raise_for_status()
        summary_data = summary_response.json()
        
        results = []
        result_dict = summary_data.get("result", {})
        
        for uid in id_list:
            if uid in result_dict:
                item = result_dict[uid]
                title = item.get("title", "No Title")
                # ESummary doesn't always give full abstract, but gives enough for a link
                # For a real abstract we'd need efetch, but let's keep it lightweight first
                pub_date = item.get("pubdate", "")
                journal = item.get("source", "")
                
                results.append({
                    "title": title,
                    "journal": journal,
                    "date": pub_date,
                    "link": f"https://pubmed.ncbi.nlm.nih.gov/{uid}/",
                    "summary": f"Published in {journal} ({pub_date})." # Placeholder for abstract
                })
                
        return results
        
    except Exception as e:
        print(f"Error fetching PubMed data: {e}")
        return []
