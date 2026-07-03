import streamlit as st
import requests
import json

# ==========================================
# Page Configuration & Styling
# ==========================================
st.set_page_config(
    page_title="AI Real Estate Search",
    page_icon="🏠",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for a modern, clean look
st.markdown("""
    <style>
    .main {
        background-color: #f8fafc;
    }
    .stTextInput input {
        border-radius: 12px;
        padding: 16px;
        font-size: 18px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .summary-box {
        background-color: #eff6ff;
        border-left: 6px solid #3b82f6;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 30px;
        color: #1e3a8a;
        font-size: 16px;
        line-height: 1.6;
    }
    .property-card {
        background-color: white;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
        height: 100%;
        border: 1px solid #f1f5f9;
    }
    .price-tag {
        font-size: 24px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 8px;
    }
    .location-tag {
        color: #64748b;
        font-size: 14px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .features-row {
        display: flex;
        gap: 16px;
        padding: 12px 0;
        border-top: 1px solid #e2e8f0;
        border-bottom: 1px solid #e2e8f0;
        margin-bottom: 12px;
        color: #475569;
        font-weight: 500;
    }
    </style>
""", unsafe_allow_html=True)

# ==========================================
# API Connection Settings
# ==========================================
API_URL = "http://127.0.0.1:8000/search"

# ==========================================
# Main App UI
# ==========================================
st.markdown("<h1 style='text-align: center; color: #0f172a; margin-bottom: 10px;'>Find your dream home with AI 🏠✨</h1>", unsafe_allow_html=True)
st.markdown("<p style='text-align: center; color: #64748b; font-size: 18px; margin-bottom: 40px;'>Describe what you're looking for, and our RAG-powered AI will find the best matches.</p>", unsafe_allow_html=True)

# Search Bar
col1, col2, col3 = st.columns([1, 6, 1])
with col2:
    query = st.text_input("", placeholder="e.g., A 2-bedroom apartment in New Cairo under 15 million...", label_visibility="collapsed")
    search_button = st.button("Search Properties", use_container_width=True, type="primary")

st.markdown("---")

# ==========================================
# Search Execution & Results
# ==========================================
if search_button and query:
    with st.spinner("🧠 AI is searching and summarizing the best properties..."):
        try:
            # Call the FastAPI backend
            response = requests.post(API_URL, json={"query": query})
            
            if response.status_code == 200:
                data = response.json()
                
                # 1. Display AI Summary
                if "summary" in data and data["summary"]:
                    st.markdown(f"""
                        <div class="summary-box">
                            <strong>✨ AI Summary:</strong><br><br>{data['summary']}
                        </div>
                    """, unsafe_allow_html=True)
                
                # 2. Display Properties
                properties = data.get("properties", [])
                
                if not properties:
                    st.warning("No properties found matching your criteria. Try adjusting your search.")
                else:
                    st.markdown(f"### 📍 Top {len(properties)} Matches Found")
                    
                    # Create a grid layout using Streamlit columns
                    cols = st.columns(3)
                    
                    for index, prop in enumerate(properties):
                        with cols[index % 3]:
                            # Image Handling
                            img_url = prop.get("photos_url", [])
                            display_img = img_url[0] if img_url and isinstance(img_url, list) else "https://via.placeholder.com/600x400?text=No+Image+Available"
                            
                            # Card Container
                            with st.container():
                                st.image(display_img, use_column_width=True)
                                
                                # Format price
                                formatted_price = f"EGP {prop.get('price', 0):,.0f}"
                                
                                st.markdown(f"<div class='price-tag'>{formatted_price}</div>", unsafe_allow_html=True)
                                st.markdown(f"<div class='location-tag'>📍 {prop.get('location', 'Unknown Location')} | {prop.get('type', 'Property')}</div>", unsafe_allow_html=True)
                                
                                st.markdown(f"""
                                    <div class='features-row'>
                                        <span>🛏️ {prop.get('bedrooms', '-')} Beds</span>
                                        <span>🛁 {prop.get('bathrooms', '-')} Baths</span>
                                        <span>📐 {prop.get('area', '-')} m²</span>
                                    </div>
                                """, unsafe_allow_html=True)
                                
                                with st.expander("View Full Description"):
                                    st.write(prop.get('description', 'No description provided.'))
                                    
                            st.markdown("<br>", unsafe_allow_html=True)
            else:
                st.error(f"Backend Error (Status {response.status_code}): Ensure your FastAPI server is running.")
                
        except requests.exceptions.ConnectionError:
            st.error("🚨 Could not connect to the backend API. Please make sure your FastAPI server is running on http://127.0.0.1:8000")
        except Exception as e:
            st.error(f"An unexpected error occurred: {e}")
