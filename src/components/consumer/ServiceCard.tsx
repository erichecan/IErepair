import Link from "next/link";

interface ServiceCardProps {
  merchantId: number;
  merchantName: string;
  address: string | null;
  eircode: string | null;
  distanceKm: number | null;
  serviceName: string;
  deviceBrand: string;
  deviceModel: string;
  price: number;
  durationMinutes: number;
  repairServiceId: number;
}

export default function ServiceCard({
  merchantId,
  merchantName,
  address,
  eircode,
  distanceKm,
  serviceName,
  deviceBrand,
  deviceModel,
  price,
  durationMinutes,
  repairServiceId,
}: ServiceCardProps) {
  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <div>
          <div style={styles.serviceTitle}>
            {serviceName} — {deviceBrand} {deviceModel}
          </div>
          <div style={styles.merchant}>{merchantName}</div>
          {(address || eircode) && (
            <div style={styles.address}>
              {address}
              {eircode ? ` · ${eircode}` : ""}
            </div>
          )}
        </div>
        <div style={styles.right}>
          <div style={styles.price}>€{price.toFixed(2)}</div>
          <div style={styles.duration}>{durationMinutes} min</div>
          {distanceKm != null && (
            <div style={styles.distance}>{distanceKm.toFixed(1)} km away</div>
          )}
        </div>
      </div>
      <div style={styles.actions}>
        <Link href={`/stores/${merchantId}`} style={styles.viewBtn}>
          View Store
        </Link>
        <Link
          href={`/repair/book?merchantId=${merchantId}&repairServiceId=${repairServiceId}`}
          style={styles.bookBtn}
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    border: "1.5px solid #f0f0f0",
    borderRadius: 16,
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    transition: "box-shadow 0.2s",
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1d1d1f",
    marginBottom: 4,
  },
  merchant: {
    fontSize: 14,
    color: "#146345",
    fontWeight: 600,
    marginBottom: 2,
  },
  address: {
    fontSize: 13,
    color: "#888",
  },
  right: {
    textAlign: "right" as const,
    flexShrink: 0,
  },
  price: {
    fontSize: 22,
    fontWeight: 800,
    color: "#1d1d1f",
  },
  duration: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  distance: {
    fontSize: 12,
    color: "#146345",
    fontWeight: 600,
    marginTop: 4,
  },
  actions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
  },
  viewBtn: {
    padding: "9px 20px",
    borderRadius: 40,
    border: "1.5px solid #e0e0e0",
    color: "#1d1d1f",
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-block",
  },
  bookBtn: {
    padding: "9px 20px",
    borderRadius: 40,
    background: "#1d1d1f",
    color: "#17db66",
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-block",
  },
};
