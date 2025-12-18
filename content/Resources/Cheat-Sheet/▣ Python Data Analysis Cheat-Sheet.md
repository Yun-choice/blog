---
tags:
  - python
  - cheat-sheet
  - 데이터분석
  - "#textmining"
  - GIS
  - crawling
---
>[!info] Overview
>Python 환경에서 데이터 분석을 위해 사용할 수 있는 다양한 코드블럭을 모아두었다.
>
>**Platform:** Python
>**First upload date:** 2025-12-03
---
# I. Useful Things

```python title="Basic Setting"
# 기본 세팅
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# 기타 설정
plt.rc('font',family='Malgun Gothic') # 한글 글꼴 설정
plt.rc('axes', unicode_minus=False) # minus 출력 에러 교정
pd.options.display.max_rows = 20 # 20row 까지만 출력
pd.set_option('display.max_columns', None) # 모든 열을 출력
```
# II. Data Collection
## 1. Crawling
### 1) requests library

```python
# import library
import requests

# basic example
url = 'https://www.naver.com'
res = requests.get(url)
res.status_code # 200 is success
res.text # 결과확인

# url encoding
url_base = 'https://www.naver.com/search'
dic_params = {'query':'최저임금', 'sort':0}
res = request.get(url_base, params = dic_params)
val_search_text_encoded = resquest.utils.quote('최저임금') # 인코딩
url = f'{url_base}?query={val_search_text_encoded}&sort=0' # 인코딩 적용된 url
```

### 2) bs4 library

```python
from bs4 import BeautifulSoup as bs

# parsing test
text = '<html><div>bs4!!</div></html>'
text_bs = bs(text, 'html.parser')
text_bs.text # 결과확인 (출력결과: 'bs4!!')

# 주요 문법 .select(): 특정 태그 접근, select_one(): 하나만 접근
text = bs('<body><div></div></body>', features = 'html.parser')
text.select('body') # body 태그
text.select('body div') # body 태그 하위의 div 태그
text.select('body > div') # body 태그 바로 아래의 div 태그
text.select('.news') # class명이 news인 태그
text.select('.news.box') # class명이 news이면서 box인 태그
text.select('div.news') # div태그 중 class명이 news인 태그
text.select('#pw') # ID가 pw인 태그
text.select('div#pw') # ID가 pw인 div태그
text.select('a[href]') # a태그 중 href속성이 있는 태그

# 예시: 네이버 뉴스 헤드라인/링크 크롤링
url_naver = 'https://search.naver.com/search.naver?ssc=tab.news.all&where=news&sm=tab_jum&query=%EC%B5%9C%EC%A0%80%EC%9E%84%EA%B8%88'
res = requests.get(url_naver)
bs_res = bs(res.text, 'html.parser')
ls_news = bs_res.select('div.group_news > ul.list_news')
ls_title = ls_news[0].select('span.sds-comps-text-type-headline1')

ls_title2 = []
for i in range(len(ls_title)):
    ls_title2.append(ls_title[i].text)
ls_title2 # news 기사 헤드라인만 남는다

ls_news_links = ls_news[0].select("div.sds-comps-base-layout > div > a[nocr='1']")
ls_news_links[0]['href'] # news기사 링크만 남는다
```

### 3) Selenium library

```python
from selenium import webdriver  # 셀레니움의 브라우저 제어 핵심 객체(드라이버 생성/제어)
from selenium.webdriver.chrome.service import Service  # ChromeDriver 실행 프로세스를 감싸는 서비스 래퍼
from selenium.webdriver.chrome.options import Options  # 크롬 실행 옵션(헤드리스, UA, 언어 등) 설정
from webdriver_manager.chrome import ChromeDriverManager  # 크롬드라이버 자동 다운로드/버전관리
from selenium.webdriver.support.ui import WebDriverWait  # 명시적 대기(조건 만족까지 대기) 유틸
from selenium.webdriver.support import expected_conditions as EC  # WebDriverWait와 함께 쓰는 조건 모음
from selenium.webdriver.common.by import By  # 요소 탐색 전략 지정용( By.ID, By.CSS_SELECTOR 등 )
from selenium.webdriver.common.keys import Keys  # 키보드 입력(ENTER, TAB 등) 상수
from selenium.webdriver.support.ui import Select  # <select> 드롭다운 전용 헬퍼(옵션 선택/조회)

# 기본 구동
service = Service(ChromeDriverManager().install())
drv = webdriver.Chrome(service = service)
wait = WebDriverWait(drv, 10)

# 예시: 문체부 국립장애인도서관 데이터 크롤링
drv.get("https://www.nld.go.kr/home/libraryPossession.do?menu=menu_03_03&low=N")
val_page = 1 # 크롤링 page번호 설정
drv.execute_script(f"tabGB({val_page});") # val_page로 이동
res = drv.page_source # requests.get(url)과 유사
bs_res = bs(res, "html.parser")
ls_thead = [t.text for t in bs_res.select("thead th")] # columns 리스트 만들기
bs_tbody_tr = bs_res.select("tbody > tr")
ls_tbody = [[t.text for t in bs_tbody_tr_1] for bs_tbody_tr_1 in bs_tbody_tr]
df_tbl = pd.DataFrame(ls_tbody, columns = ls_thead) # val_page의 데이터 크롤링 완료.

```

```python title="page scroll function"
# scroll container 지정
scroll_by = drv.find_element(By.CSS_SELECTOR, 'div#scroll_container') scroll_by.send_keys(Keys.End) # End 키 
scroll_by.send_keys(Keys.PaheDn) # PageDn 키
```

## 2. API

### 1) basic form

```python
import requests

# 예시: 국토교통부 아파트 실거래가api
service_key = 'your_key'
url = 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade'
params = {
    "serviceKey": service_key,      # 필수: 서비스 인증키
    "LAWD_CD":    "11110",          # 필수: 행정구역 코드
    "DEAL_YMD":   "202407",         # 필수: 조회년월 (YYYYMM)
    "pageNo":     "1",              # 옵션: 페이지 번호
    "numOfRows":  "100"             # 옵션: 한 페이지 결과 수
}
```

### 2) GCP geocoding

```python 
import googlemaps

# 주소 -> 위/경도 좌표 변환
key = 'your_key'
addr = '서울역'
gmaps = googlemaps.Client(key=key)
res_cd = gmaps.geocode(addr)
lat = res_cd[0]['geometry']['location']['lat']
lng = res_cd[0]['geometry']['location']['lng']

def gcp_geocoding(addr): # 사용자 정의함수
    gmaps = googlemaps.Client(key = key)
    res_cd = gmaps.geocode(addr)
    val_lat = res_cd[0]["geometry"]["location"]["lat"]
    val_lng = res_cd[0]["geometry"]["location"]["lng"]
    return [val_lat, val_lng]
df[['lat', 'lon']] = df['addr'].apply(gcp_geocoding).apply(pd.Series)

# 위/경도 -> 주소 변환 (reverse_geocode)
key_geo = 'your_key'
gmaps = googlemaps.Client(key=key_geo)
def gcp_rev_geocoding(lat, lon):
    result = gmaps.reverse_geocode((latitude, longitude))
    dic_addr = result[0]['formatted_address']
    return dic_addr # 주소 문자열 반환
```

### 3) kakao map api^kakao-api

```python
import request

# kakao api 호출
url = "https://dapi.kakao.com/v2/local/search/address.json" #요청할 url 주소
Key = 'your_rest_api_key' #REST API 키(유효한 키)
headers = {"Authorization": f"KakaoAK {key}"} 
addr = '서울특별시 종로구 청와대로 1'

result = requests.get(url, headers=headers,
                      params = {'query': addr}).json()
                      
region_1depth = result['documents'][0]['address']['region_1depth_name']
region_2depth = result['documents'][0]['address']['region_2depth_name']
lon = result['documents'][0]['address']['x']
lat = result['documents'][0]['address']['y']
```

# III. Data Analysis

## 1. EDA

### 1) 상관분석

```python
df = dataframe.corr() # 상관관계 
sns.heatmap(df, cmap = 'RdYlBu_r', # 파~빨 
			annot = True, # 실제 값을 표시한다 
			mask= df < 0.2, # 표시하지 않을 마스크 부분을 지정한다 
			linewidths=.5, # 경계면 실선으로 구분하기 
			cbar_kws={"shrink": .5},# 컬러바 크기 절반으로 줄이기 
			vmin = -1,vmax = 1 # 컬러바 범위 -1 ~ 1 )
```

## 2. Text Mining

### 1) 빈도 분석

```python title="text tokenizing"
# 단어 토큰화
ser_msg = df_msg.loc[, 'MSG_CN'] # 문자열 Series 
ser_msg = ser_msg.str.replace("\\(.*?\\)", "", regex=True)  # 괄호 () 안의 모든 내용을 제거. 예: "(사진=뉴스1)" → ""
ser_msg = ser_msg.str.replace("\\{.*?\\}", "", regex=True)  # 중괄호 {} 안의 모든 내용을 제거
ser_msg = ser_msg.str.replace("\\[.*?\\]", "", regex=True)  # 대괄호 [] 안의 모든 내용을 제거
ser_msg = ser_msg.str.replace("[^가-힣A-Za-z0-9]", " ", regex=True)  # 한글과 영어를 제외한 모든 문자(숫자, 특수문자 등)를 공백으로 대체
ser_msg = ser_msg.str.replace(" {2,}", " ", regex=True)  # 두 칸 이상의 연속된 공백을 하나의 공백으로 축소
ser_msg = ser_msg.str.replace("^ | $", "", regex=True)  # 문장 맨 앞 또는 맨 뒤에 있는 공백 제거

# 단어 빈도수 DataFrame
ser_msg = ser_msg.str.split(" ").explode()
ser_msg_cnt = ser_msg.value_counts()
ser_msg_cnt.index.name = "word"
df_msg_cnt = ser_msg_cnt.reset_index()

# 불용어 제거
df_msg_cnt_cut = df_msg_cnt.loc[df_msg_cnt["word"].str.len() >= 2, ] # 허용 단어 길이 지정
val_regex = "(다|는|고|은|을)$" # 불용어(동사 등) 지정
msg_cnt_cut = df_msg_cnt_cut.loc[~df_msg_cnt_cut["word"].str.contains(val_regex), ] # 불용어 제외
```

```python title="wordcloud"
from wordcloud import WordCloud

dic_cmt_cnt = dict(zip(df_msg_cnt_cut["word"], df_msg_cnt_cut["count"]))
#mask = np.array(Image.open("image.png")) # wordcloud 마스크 지정

obj_wc = WordCloud(font_path = "C:/Windows/Fonts/malgun.ttf",
                   width = 400, height = 400,
                   max_font_size = 120,
                   min_font_size = 10,
                   prefer_horizontal=0.5,
                   mask = mask,
                   colormap='YlGnBu',
                   background_color = "#FFFFFF",
                   random_state = 123)

obj_wc = obj_wc.generate_from_frequencies(dic_cmt_cnt)

plt.figure(figsize=(16,8))
plt.imshow(obj_wc)
plt.axis("off")
plt.show()
```

### 2) 형태소 분석 using Kiwi

```python title="Using 'Kiwi' tokenizer"
from kiwipiepy import Kiwi
kiwi = Kiwi()

text = '나 당장 집에 가고싶어'
tokens = kiwi.tokenize(text) # 형태소 나눠짐

# 워드클라우드 등 빈도분석을 위한 명사, 형용사 필터링
def udf_kiwi_nv_tokenizer(text):
    if pd.notna(text):
        tokens = kiwi.tokenize(text)
        existed_text = []
        for val_token in tokens:
            if val_token.tag in ['NNG','NNP','VA']:
                existed_text.append(val_token.form)
        return existed_text
    else:
        return np.nan
```

### 3) 감성 분석 using HuggingFace

```python title="Using 'Korean-Sentiment' model"
import os
from transformers import pipeline # hugging face

# hugging face api key
os.environ["HF_TOKEN"] = 'your key'

# Korean_sentiment 감성 분석 모델 가져오기 및 작동 확인
classifier = pipeline("text-classification", model="matthewburke/korean_sentiment")
custom_tweet = "영화 재밌다."
preds = classifier(custom_tweet, return_all_scores=True)
is_positive = preds[0][1]['score'] > 0.5
print(is_positive)

# UDF 생성
def review_PN_classifier(text):
  preds = classifier(text, return_all_scores=True)
  n_score = round(preds[0][0]['score'], 2)
  p_score = round(preds[0][1]['score'], 2)
  return n_score, p_score # df['text'].apply(review_PN_classifier).apply(pd.Series)
```

## 3. GIS 분석
### 1) Geopandas

```python
import geopandas as gpd

df_geo = gpd.read_file('map_sido.shp', encoding='cp949')
ser_cent = df_geo['geometry'].centroid # return 위/경도 tuple
df_loc = pd.DataFrame(dict(loc = df_geo['CTP_KOR_NM'],
                            lon = ser_cent.x,
                            lat = ser_cent.y))
```

### 2) Folium

```python
import folium

# 예시 데이터프레임 생성
df = pd.DataFrame(dict(
    lat=[37.5665, 37.5670, 37.5650],
    lon=[126.9780, 126.9790, 126.9770],
    col = ['green','red','blue'],
    icon=["image", "poo", "wand-magic-sparkles"]
))
# 서울 지도 생성
m = folium.Map(location = [37.6, 126.8], tiles='cartodbpostron', attr='Google')

for idx, row in df.iterrows():
	folium.Marker(
		location=[row['lat'], row['lon'],
		icon=folium.Icon(icon=row['icon'], color=row['col'], prefix='fa')).add_to(m)
		
```
