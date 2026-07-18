# Nyc-Airbnb-Listing


This repository presents a K-Means clustering analysis of 20,590 NYC Airbnb listings (2024 dataset). Using a KNIME workflow to scale and cluster 14 numeric features, the analysis surfaces five distinct, room-type-aligned market segments — from budget shared rooms to premium multi-bedroom homes — and visualizes them through an interactive React/Recharts dashboard.

Overview


Dataset: 20,590 listings · 25 original features
Algorithm: K-Means (Lloyd's method), k = 5, 10 initializations, seed = 42
Preprocessing: 14 numeric features scaled with a StandardScaler-style normalizer
Result quality: Silhouette score of 0.2435 at k = 5, chosen over higher-silhouette values of k for interpretability, since k = 5 aligns cleanly with Airbnb's own room-type categories
Deliverables: KNIME workflow analysis (PDF), clustered listings (Excel), and an interactive dashboard (JSX)


Workflow

The analysis was built as a KNIME pipeline:

Excel Reader → Missing Value → Normalizer → k-Means → Color Manager → Interactive View


Excel Reader — loads new_york_listings_2024_clean.xlsx
Missing Value — data was clean going in; no nulls detected
Normalizer — standardizes the 14 numeric features used for clustering
k-Means — k = 5, 10 random initializations, seed = 42
Color Manager — assigns a consistent color per cluster for downstream visuals
Interactive View — PCA scatter plot and summary statistics


Cluster count was chosen after comparing silhouette scores across k = 2–8; while k = 6 and k = 7 scored marginally higher, k = 5 was selected because it maps directly onto interpretable, real-world room-type segments.

Cluster Segments

ClusterSegmentShareAvg. PriceMedian PriceAvg. RatingTop BoroughC0 🏠Entire Home — Standard43.5%$167$1453.90Manhattan (48%)C1 🚪Private Room41.8%$102$803.88Brooklyn (39%)C2 🏡Entire Home — Premium12.8%$338$2863.86Brooklyn (42%)C3 🛋️Shared Room1.4%$100$753.71Brooklyn (42%)C4 🏨Hotel Room0.5%$289$2213.49Manhattan (90%)

Highlights:


C0 (Entire Home — Standard) and C1 (Private Room) together account for ~85% of all listings, forming the core of the NYC short-term rental market.
C2 (Entire Home — Premium) listings average 2.84 bedrooms and 1.77 baths — clearly larger, multi-room properties.
C4 (Hotel Room) is a small but distinct segment: shortest minimum-night stays (9.0 nights avg.), highest review counts, and 90% concentrated in Manhattan.
C3 (Shared Room) is the smallest and lowest-rated segment, catering to the most budget-conscious travelers.


On the PCA scatter, PC1 separates listings by room type (private rooms cluster left, standard entire homes center, premium homes far right), while PC2 captures residual price/size variance. Hotel rooms sit near the origin, overlapping other clusters — consistent with their small sample size (109 listings).

Repository Contents

FileDescriptionny_clustering_knime.jsxInteractive React dashboard (Overview, PCA Scatter, Cluster Profiles, Geography tabs) built with Rechartsny_listings_clustered.xlsxFull dataset with cluster assignmentsNYC_Listings_KNIME_Analysis.pdfKNIME workflow export and analysis writeupREADME.mdThis file

Dashboard

The dashboard (ny_clustering_knime.jsx) is a self-contained React component with four views:


Overview — cluster size, average vs. median price, and silhouette-by-k charts
PCA Scatter — an 800-point sample plotted on PC1/PC2, with per-cluster highlighting
Profiles — a normalized feature radar chart plus a full attribute table per cluster
Geography — borough distribution (%) for each cluster


To run it locally, drop the component into any React project with recharts installed:

bashnpm install recharts

Then import and render App from ny_clustering_knime.jsx.

Tech Stack


Analysis: KNIME Analytics Platform (Excel Reader, Normalizer, K-Means, Color Manager nodes)
Visualization: React + Recharts (ScatterChart, BarChart, RadarChart)
Data: Excel (.xlsx)


Author

Yashas Madan
