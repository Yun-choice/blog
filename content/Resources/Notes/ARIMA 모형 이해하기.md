---
tags:
  - ML
  - 데이터분석
publish: true
---
>[!info] Overview
>abstract
>
>**Platform:** Quartz
>**First upload date:** 2025-12-15
---
# I. 들어가며
# II. 본문

## 1. ARIMA 모델이란?

ARIMA 모델은 자기 회귀 모델(AutoRegressive: AR)이라 불리는 AR 모델과 이동 평균 모델(MovingAverage: MA)이라 불리는 MA 모델을 결합한 후 차분을 통해 정상성을 띄지 않는 데이터에 대해서도 예측을 수행해내는 모델입니다.

일반적으로 자연계에 존재하는 데이터는 정상성을 띄지 않는 경우가 많기에 가장 기본적으로 사용됩니다.

계절성(Seasonal)을 추가로 고려한 SARIMA와 독립변수를 추가한 ARIMAX 파생 모델이 존재합니다.

## 2. 정상성(Stationary)이란?

정상성이란, 아래 3개 조건을 만족하는 상태를 말합니다.

1. 모든 시간에서 일정한 평균(mean)
2. 모든 시간에서 일정한 분산(variance)
3. 두 시점 간 공분산이 타 시점과 무관

그러나, 현실상의 시계열 데이터 대부분은 이 정상성을 만족하지 않습니다.

시계열 데이터가 정상성을 띄지 않으면, AR, MA 등 시계열 모델을 사용할 수 없기 때문에 정상성을 띄도록 변환을 해주어야 합니다.

이때 쓰이는 방법이 차분과 로그 변환입니다.

ARIMA 모델은 여기서 차분을 사용합니다.

## 3. 차분이란?

$$x_t = X_t - X_{t-1}$$

로 나타낼 수 있습니다. ~~~~

## 4. ARIMA 모델의 차수(p,d,q) 선택법



## III. 나가며
---
## 관련 게시글 & 참고문헌

- [시계열 분석, ARIMA model - 동구리](https://dong-guri.tistory.com/9)
- [정상성(Stationarity) 뽀개기 - Be Geeky](https://assaeunji.github.io/statistics/2021-08-08-stationarity/)
