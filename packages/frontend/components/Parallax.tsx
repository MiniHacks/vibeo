import { motion, useScroll, useTransform } from "framer-motion";

interface Props {
  children: React.ReactNode;
  offset: number;
}

export default function Parallax({
  children,
  offset = 300,
}: Props): JSX.Element {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, offset], [0, -offset]);
  return (
    <div>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}
