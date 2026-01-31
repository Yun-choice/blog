---
{"publish":true,"created":"2026-01-19T23:56:25.084+09:00","modified":"2026-01-31T21:22:05.049+09:00","published":"2026-01-31T21:22:05.049+09:00","tags":["Tableau"],"cssclasses":""}
---

>[!info] Overview
>Tableau의 계산된 필드를 만들기 위한 여러 함수들이 모인 Cheat-Sheet입니다.
>
>**Platform:** Tableau
>
>**First upload date:** 2026-01-20
---
# I. Map

## 1. Spatial Functions (공간 함수)

### 1) `MAKEPOINT()`: lat/lon -> dot

**위도, 경도** 데이터를 지도 위 **"점"으로 변환**합니다.

- **Code:** `MAKEPOINT([lat], [lon])`
- **Utillize:** `BUFFER()`, `DISTANCE()` 등과 조합하기 위한 기본 세팅
- **Ex)**
	1. 계산된 필드 'Starbucks_loc' 생성 
	2. 지도시각화 및 custom 도형 부여

### 2) `BUFFER()`: make "Circle Area"

특정 지점을 기준으로 **반지름 n의 "Circle Area"** 생성

- **Code:** `BUFFER([standard], 500, 'm')` (기준점, 거리, 단위)
- **Utillize:** 매개변수 이용하여 가변화 상권 분석 및 거리 기반 시각화
- **Ex)**
	1. 매개변수 'p_Buffer' 생성 (정수, 100~1000)
	2. 계산된 필드 'c_Buffer' 생성 `BUFFER([강남역 포인트], [p_Buffer], 'm')`
	3. 매개변수 'p_Buffer' 표시 및 원 크기 설정

### 3) `DISTANCE()`: calculate "Distance"

지도의 두 점 사이 **직선거리 계산**

- **Code:** `DISTANCE([시작 지점], [끝 지점], 'm')`
- **Utillize:** 매장 간 거리 계산을 통한 입지 최적화
- **Ex)**
	1. 계산된 필드 'DISTANCE' 생성 `DISTANCE([Starbucks_loc], [강남역 포인트], 'm')
	2. 레이블에 추가

### 4) `INTERSECTS()`: if "Overlap"

두 공간 데이터(점, 선, 면)가 **겹쳐 있는지** 확인 (**return T/F**)

- **Code:** `INTERSECTS([도형1], [도형2])`
- **Utillize:** 매장 간 거리 계산을 통한 입지 최적화
- **Ex)**
	1. 계산된 필드 'INTERSECTS' 생성 `INTERSECTS([Starbucks_loc], [c_Buffer])`
	2. 필터 추가 '참(True)' -> Circle Area와 겹치는 매장만 표시시





---
## 관련 게시글
## 참고문헌