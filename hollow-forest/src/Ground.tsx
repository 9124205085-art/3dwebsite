export function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[360, 360]} />
      <meshStandardMaterial color="#1a1d24" />
    </mesh>
  )
}
