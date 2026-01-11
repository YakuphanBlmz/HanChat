import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from src.analyzer import ChatAnalyzer
from wordcloud import WordCloud
import matplotlib.pyplot as plt

# Page Config
st.set_page_config(
    page_title="WIA-Bot Dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize Analyzer
@st.cache_data
def load_data():
    analyzer = ChatAnalyzer()
    if analyzer.load_data():
        return analyzer
    return None

analyzer = load_data()

# Sidebar
st.sidebar.title("🤖 WIA-Bot")
st.sidebar.markdown("---")

if analyzer:
    # Sidebar Filters
    st.sidebar.header("Filtreler")
    
    # Date Filter
    min_date = analyzer.df['date'].min()
    max_date = analyzer.df['date'].max()
    
    start_date = st.sidebar.date_input("Başlangıç", min_date)
    end_date = st.sidebar.date_input("Bitiş", max_date)
    
    # Filter Data
    mask = (analyzer.df['date'] >= start_date) & (analyzer.df['date'] <= end_date)
    filtered_df = analyzer.df.loc[mask]
    
    # Update Analyzer with filtered data (Temporary hack or better method needed)
    # For now, we will just use filtered_df for charts
    
    st.sidebar.markdown("---")
    menu = st.sidebar.radio("Menü", ["🏠 Genel Bakış", "⏳ Zaman Analizi", "💬 Dil & İçerik", "📂 Veri"])

    # --- MAIN CONTENT ---
    
    # --- MAIN CONTENT ---
    
    if menu == "🏠 Genel Bakış":
        st.title("📊 Genel Bakış")
        st.markdown("Bu sayfada sohbet geçmişinizin genel bir özetini görebilirsiniz.")
        
        # KPI Cards
        col1, col2, col3 = st.columns(3)
        
        total_msgs = len(filtered_df)
        active_senders = filtered_df['sender'].nunique()
        top_sender = filtered_df['sender'].mode()[0] if not filtered_df.empty else "N/A"
        
        col1.metric("Toplam Mesaj Sayısı", total_msgs, help="Seçilen tarih aralığındaki toplam mesaj sayısı.")
        col2.metric("Kişi Sayısı", active_senders, help="Sohbette mesajı bulunan farklı kişi sayısı.")
        col3.metric("En Çok Yazan", top_sender, help="En fazla mesaj gönderen kişi.")
        
        st.divider()
        
        # Charts Row 1
        col_c1, col_c2 = st.columns(2)
        
        with col_c1:
            st.subheader("Kim Ne Kadar Yazdı?")
            st.caption("Sohbetteki mesajların kullanıcılara göre dağılımı.")
            sender_counts = filtered_df['sender'].value_counts().reset_index()
            sender_counts.columns = ['Sender', 'Count']
            fig_pie = px.pie(sender_counts, values='Count', names='Sender', hole=0.4)
            st.plotly_chart(fig_pie, use_container_width=True)
            
        with col_c2:
            st.subheader("Günlük Mesajlaşma Trendi")
            st.caption("Hangi günlerde daha çok mesajlaşıldığını gösterir.")
            daily_counts = filtered_df.groupby('date').size().reset_index(name='Count')
            fig_line = px.line(daily_counts, x='date', y='Count', markers=True)
            st.plotly_chart(fig_line, use_container_width=True)

    elif menu == "⏳ Zaman Analizi":
        st.title("⏳ Zaman Analizi")
        st.markdown("Mesajlaşma alışkanlıklarınızın zamana göre analizi.")
        
        # Heatmap Data
        df_heat = filtered_df.copy()
        df_heat['day_of_week'] = df_heat['timestamp'].dt.day_name()
        days_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        tr_days = {'Monday': 'Pazartesi', 'Tuesday': 'Salı', 'Wednesday': 'Çarşamba', 'Thursday': 'Perşembe', 'Friday': 'Cuma', 'Saturday': 'Cumartesi', 'Sunday': 'Pazar'}
        df_heat['day_of_week'] = df_heat['day_of_week'].map(tr_days)
        tr_days_order = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
        
        df_heat['day_of_week'] = pd.Categorical(df_heat['day_of_week'], categories=tr_days_order, ordered=True)
        heatmap_data = df_heat.pivot_table(index='day_of_week', columns='hour', values='id', aggfunc='count', fill_value=0)
        
        st.subheader("Haftalık Yoğunluk Haritası")
        st.info("Bu grafik, haftanın hangi günlerinde ve günün hangi saatlerinde daha aktif olduğunuzu gösterir. Koyu renkler daha az, parlak renkler daha çok mesajı ifade eder.")
        fig_heat = px.imshow(heatmap_data, labels=dict(x="Saat (00:00 - 23:00)", y="Gün", color="Mesaj"), aspect="auto", color_continuous_scale="Viridis")
        st.plotly_chart(fig_heat, use_container_width=True)
        
        st.divider()
        
        st.subheader("Günün Hangi Saatleri Aktif?")
        st.caption("Genel olarak günün hangi saatlerinde mesajlaşma yoğunlaşıyor?")
        hourly_counts = filtered_df['hour'].value_counts().sort_index().reset_index(name='Count')
        fig_bar = px.bar(hourly_counts, x='hour', y='Count', labels={'hour': 'Saat', 'Count': 'Mesaj Sayısı'})
        st.plotly_chart(fig_bar, use_container_width=True)

    elif menu == "💬 Dil & İçerik":
        st.title("💬 Dil ve İçerik Analizi")
        st.markdown("Konuşmalarınızda en çok nelerden bahsediyorsunuz?")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Kelime Bulutu")
            st.caption("En sık kullanılan kelimeler. Kelime ne kadar büyükse o kadar çok kullanılmış demektir.")
            
            text = " ".join(filtered_df['content'].dropna().astype(str).tolist()).lower()
            stopwords = {'bir', 'bu', 'ne', 've', 'için', 'çok', 'ama', 'de', 'da', 'o', 'ben', 'sen', 'şu', 'var', 'yok', 'mı', 'mi', 'mu', 'mü', 'media/other', 'unknown'}
            
            # Fixed colormap to 'viridis' or 'Blues'
            wc = WordCloud(width=800, height=400, background_color='white', stopwords=stopwords, colormap='viridis').generate(text)
            
            fig, ax = plt.subplots()
            ax.imshow(wc, interpolation='bilinear')
            ax.axis('off')
            st.pyplot(fig)
            
        with col2:
            st.subheader("En Sık Kullanılan Kelimeler (Liste)")
            st.caption("Kelime kullanım sayıları.")
            
            words = [w for w in text.split() if w not in stopwords and len(w) > 2]
            word_counts = pd.Series(words).value_counts().head(10).reset_index()
            word_counts.columns = ['Word', 'Count']
            fig_words = px.bar(word_counts, x='Count', y='Word', orientation='h', labels={'Count': 'Tekrar Sayısı', 'Word': 'Kelime'})
            fig_words.update_layout(yaxis={'categoryorder':'total ascending'})
            st.plotly_chart(fig_words, use_container_width=True)

    elif menu == "📂 Veri":
        st.title("📂 Ham Veri")
        st.markdown("Veritabanındaki ham mesaj verilerini buradan inceleyebilirsiniz.")
        st.dataframe(filtered_df)

else:
    st.error("Veri bulunamadı! Lütfen önce 'main.py' üzerinden veri çekin.")
    st.info("Terminali açıp `python main.py` komutunu çalıştırın ve 'Veri Çek' seçeneğini kullanın.")
