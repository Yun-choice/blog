### code box
>[!abstract]- Googlemaps api Code
>	```
>	import googlemaps
>	import time
>	
>	# Google Maps API 키 설정
>	gmaps = googlemaps.Client(key='Your Key')		
>	
>	# 좌표 저장용 컬럼 추가
>	df_2025['위도_geo'] = None
>	df_2025['경도_geo'] = None
>	
>	# 주소 컬럼 할당
>	addr = 'addr'
>	
>	# 주소 → 위경도 변환
>	for idx, row in df_2025.iterrows():
>		address = row[addr]
>		try:
>			geocode_result = gmaps.geocode(address)
>			if geocode_result:
>				location = geocode_result[0]['geometry']['location']
>				df_2025.at[idx, '위도_geo'] = location['lat']
>				df_2025.at[idx, '경도_geo'] = location['lng']
>			else:
>				print(f"[경고] 주소를 찾을 수 없음: {address}")
>		except Exception as e:
>			print(f"[에러] {address} 변환 실패: {e}")
>		time.sleep(0.01)  # 과도한 요청 방지 (QPS 제한 고려)
>	```

### hidden box
<details> <summary>Short Summary</summary> <p>text to hide</p> </details>

### iframe
<iframe width='700' height='200' src="https://taketech019.github.io"></iframe>

