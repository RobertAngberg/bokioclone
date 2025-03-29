function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="p-5">
          <div className="h-4 skeleton rounded"></div>
        </td>
      ))}
    </tr>
  );
}

export { SkeletonRow };
