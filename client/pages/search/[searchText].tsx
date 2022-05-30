import type { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { getSearchResult } from "../../src/services/user-service";
import { DetailPage } from "../../src/component/DetailPage/DetailPage";
import { SearchBar } from "../../src/component/SearchBar";
import { RightWrong } from "../../src/component/SearchPage/RightWrong";
import { SimilarResults } from "../../src/component/SearchPage/SimilarResults";

const Search: NextPage = () => {
  const [result, setResult] = useState<any[]>([]);

  const router = useRouter();
  const { searchText } = router.query;

  const getData = async () => {
    if (searchText) {
      const search = await getSearchResult(searchText);
      console.log(search);
      setResult(search);
    }
  };

  useEffect(() => {
    getData();
  }, [searchText]);

  return (
    <>
      {/* <SearchBar /> */}
      <RightWrong result={result} />
      <DetailPage id={result.detail._id} />
      <SimilarResults result={result} />
    </>
  );
};

export default Search;