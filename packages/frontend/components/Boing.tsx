import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  delayTime: number;
}

// makes div go boing
export default function Boing({ children, delayTime=0 }: Props): JSX.Element {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 20, delay: delayTime} }}
      >
        {children}
      </motion.div>
    </div>
  );
}
