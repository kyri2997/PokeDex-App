import React, { createContext, useContext, useState, ReactNode } from "react";

type Pokemon = { id: number; name: string };

type FavouritesContextType = {
  favourites: Pokemon[];
  addFavourite: (p: Pokemon) => void;
  removeFavourite: (name: string) => void;
  isFavourite: (name: string) => boolean;
};

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export const FavouritesProvider = ({ children }: { children: ReactNode }) => {
  const [favourites, setFavourites] = useState<Pokemon[]>([]);

  const addFavourite = (p: Pokemon) => {
    setFavourites((prev) => [...prev.filter((f) => f.name !== p.name), p]);
  };

  const removeFavourite = (name: string) => {
    setFavourites((prev) => prev.filter((f) => f.name !== name));
  };

  const isFavourite = (name: string) => favourites.some((f) => f.name === name);

  return (
    <FavouritesContext.Provider value={{ favourites, addFavourite, removeFavourite, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (!context) throw new Error("useFavourites must be used within a FavouritesProvider");
  return context;
};
