---
tags:
  - 데이터분석
  - 시계열데이터
작성일: 2026-08-01
---
## 들어가며

안녕하세요, 최근 세상의 모든 데이터에는 잡음이 꼭 있다는 생각이 듭니다.
대표적인 잡음으로 세상의 4차원 축, 시간이 있겠습니다.

오늘은 시계열 데이터를 더욱 객관적으로 분석하기 위한 방법론, STL(Seasonal-Trend decomposition using Loess)에 대해 알아보겠습니다.

## 1. STL이란?

시계열 데이터는 Trend(추세), Seasonal(계절성), Remainder(나머지) 세 성분으로 나누어 볼 수 있습니다. 
여기서 추세와 계절성은 분석 과정에서 따로 보아야 할 잡음으로, 어떠한 시간에 따른 변화를 측정 및 분석할 때 이러한 시계열 성분을 분해하여 구별할 필요가 있습니다.

STL은 이러한 시계열 성분을 쉽고 단순하게 분해하고, 극단값에 robust하며, 로그 변환 시 승법 분해 또한 가능한 팔방미인 시계열 분해 방법론으로, 처음 제시된 1990년 이후로 현재까지 꾸준히 사랑 받고 있습니다.

STL에서 시계열 $Y_t$는 다음의 수식으로 나타냅니다. (가법)

$$Y_t = T_t + S_t + R_t , \quad t = 1, \dots, N$$

## 2. STL을 쓰는 상황

1. 관측된 변화의 원인 파악: "금월 매출이 10% 올랐다"는 관측된 변화를 시계열 분해 했을 때 만약 `Trend 6% + Seasonal 2% + Remainder 2%` 라는 값이 도출되었다면, "추세 요인이 대부분이었다" 라는 판단이 가능해집니다.

2. 서로 다른 시점 혹은 카테고리 간 비교: 전월 대비 비교, 혹은 서로 다른 카테고리 상품끼리의 비교 시, 시계열적 요소를 제거하지 않는다면 동등한 비교가 성립하지 않습니다. STL로 동일한 축에서 비교가 가능하도록 만들 필요가 있습니다.

3. **시계열 성분의 정량적 강도 측정:** 분해 결과로 추세 강도 $F_T$​와 계절 강도 $F_S$
​를 0~1 값으로 계산할 수 있습니다. 만약 $F_S$​가 0.9라면 계절항이 필수, 0.3이라면 불필요하다는 판단을 내릴 수 있으며, 규모가 다른 카테고리도 동등히 비교할 수 있게 됩니다.

## 3. 시계열 분해 방법

우선 계절성과 추세 둘 중 하나를 구하면 다른 하나도 구할 수 있습니다.

그렇기에, STL은 추세와 계절성을 교대로 추정합니다. 추세를 0으로 놓고 시작해 계절성을 구하고, 해당 계절을 뺀 뒤 추세를 구하는 식입니다.

계절성을 구할 때 STL은 시계열 자료를 위상별로 재배열합니다. 
만약 10년치 월별 데이터를 사용한다면, 월단위로 모은 12개의 부분수열을 만들고 각각에 Loess(국소회귀)를 적용하여 "n월 효과(계절성)의 10년간의 변화량"을 도출합니다.
이후, 계절성을 뺀 $Y_t = T_t + R_t$에 다시 Loess를 적용하여 추세를 추출합니다. 
나머지는 Remainder가 됩니다. _(어원의 발견?)_

## 4. 시계열 성분 강도 측정 로직

계절성을 뺀 시계열 자료의 수식은 $Y_t = T_t + R_t$ 입니다.

만약, 해당 자료의 추세가 강할 경우 `Trend에 의한 변동 > Remainder` 가 되어, 둘을 합한 값의 분산이 Remainder 단일 분산보다 클 것입니다. 

$$Var(T_t + R_t)$ > $Var(R_t)$$

반대로, 해당 자료의 추세가 없거나 매우 약할 경우 `Trend에 의한 변동 ≒ Remainder` 가 될 것입니다.  

$$Var(T_t + R_t)$ ≒ $Var(R_t)$$

즉, 추세 강도를 나타내는 통계량 $F_T$는 다음과 같이 정의됩니다.

$$F_T = \max\left(0, 1 - \frac{\text{Var}(R_t)}{\text{Var}(T_t + R_t)}\right)$$
_= Trend가 강할수록 $F_T$는 1에 수렴, 약할수록 0에 수렴._

마찬가지로 계절성 강도를 나타내는 통계량 $F_S$는 다음과 같이 정의됩니다.

$$F_S = \max\left(0, 1 - \frac{\text{Var}(R_t)}{\text{Var}(S_t + R_t)}\right)$$

---
## 참고문헌

- Cleveland, R. B., Cleveland, W. S., McRae, J. E., & Terpenning, I. (1990). STL: A Seasonal-Trend Decomposition Procedure Based on Loess (with Discussion). *Journal of Official Statistics*, 6(1), 3–73.
- Hyndman, R. J., & Athanasopoulos, G. (2021). *Forecasting: Principles and Practice* (3rd ed.). OTexts. <https://otexts.com/fppkr/>
- Andrews, D. F. (1974). A Robust Method for Multiple Linear Regression. *Technometrics*, 16(4), 523–531.
- Persons, W. M. (1919). Indices of Business Conditions. *The Review of Economics and Statistics*, 1(1), 5–107.
- [시계열 자료분석을 활용한 고객 관심사의 선제적 반영](https://playinpap.github.io/time-series-analysis-for-customer-interests/)
- [[시계열 분석] 시계열분해(2) - 추세 구해보기(이동평균, Loess)](https://sequence-data.tistory.com/17)
- [LOESS 로컬 회귀 분석과 비선형 추세선 시각화: LOESS vs MARS vs GAM](https://ikmyungterranblog.netlify.app/posts/2026-06-30-loess-local-regression-guide/)
- [`statsmodels.tsa.seasonal.STL`](https://www.statsmodels.org/stable/generated/statsmodels.tsa.seasonal.STL.html)

